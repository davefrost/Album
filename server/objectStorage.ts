import { Response } from "express";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";
import { createReadStream } from "fs";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  constructor() {}

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Set it to a local directory path."
      );
    }
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<string | null> {
    const searchPaths = (process.env.PUBLIC_OBJECT_SEARCH_PATHS || "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    for (const basePath of searchPaths) {
      const fullPath = path.join(basePath, filePath);
      try {
        await fs.access(fullPath);
        return fullPath;
      } catch {
        continue;
      }
    }

    return null;
  }

  async downloadObject(filePath: string, res: Response, cacheTtlSec = 3600) {
    try {
      const stat = await fs.stat(filePath);
      res.set({
        "Content-Type": "application/octet-stream",
        "Content-Length": stat.size,
        "Cache-Control": `private, max-age=${cacheTtlSec}`,
      });

      const stream = createReadStream(filePath);
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  async getObjectEntityUploadPath(): Promise<string> {
    const dir = this.getPrivateObjectDir();
    const objectId = randomUUID();
    const uploadPath = path.join(dir, "uploads", objectId);
    await fs.mkdir(path.dirname(uploadPath), { recursive: true });
    return uploadPath;
  }

  async getObjectEntityFile(objectPath: string): Promise<string> {
    const dir = this.getPrivateObjectDir();
    const fullPath = path.join(dir, objectPath.replace(/^\/objects\//, ""));
    try {
      await fs.access(fullPath);
      return fullPath;
    } catch {
      throw new ObjectNotFoundError();
    }
  }

  normalizeObjectEntityPath(rawPath: string): string {
    const dir = this.getPrivateObjectDir();
    const relativePath = path.relative(dir, rawPath);
    return `/objects/${relativePath}`;
  }
}
