import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { insertMediaSchema, insertAlbumSchema, insertApiKeySchema, insertThemeSchema } from "@shared/schema";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import session from "express-session";

// Simple session-based authentication
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: any;
  }
}

// Auth middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

const requireAdmin = async (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  app.use(session({
    secret: process.env.SESSION_SECRET || "photovault-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    
    console.log("Login attempt:", { username, passwordLength: password?.length });
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const user = await storage.getUserByUsername(username);
    console.log("User found:", user ? { username: user.username, hasPassword: !!user.password } : "No user found");
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    console.log("Password comparison result:", isValid);
    
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.userId = user.id;
    req.session.user = { id: user.id, username: user.username, email: user.email, role: user.role };
    
    res.json({ user: req.session.user });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // Object storage routes
  app.get("/objects/:objectPath(*)", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const objectStorageService = new ObjectStorageService();
    
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      
      if (!canAccess) {
        return res.sendStatus(403);
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  // Media routes
  app.get("/api/media", async (req, res) => {
    const { albumId, userId, public: isPublic } = req.query;
    
    try {
      let media;
      
      if (albumId) {
        media = await storage.getMediaByAlbumId(albumId as string);
      } else if (userId && req.session.userId) {
        media = await storage.getMediaByUserId(userId as string);
      } else if (isPublic) {
        media = await storage.getPublicMedia();
      } else {
        media = await storage.getRecentMedia();
      }
      
      res.json({ media });
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ error: "Failed to fetch media" });
    }
  });

  app.get("/api/media/search", async (req, res) => {
    const { q } = req.query;
    
    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Search query required" });
    }
    
    try {
      const media = await storage.searchMedia(q, req.session.userId);
      res.json({ media });
    } catch (error) {
      console.error("Error searching media:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.post("/api/media", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    
    try {
      const mediaData = insertMediaSchema.parse(req.body);
      
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.objectPath,
        {
          owner: userId,
          visibility: mediaData.isPublic ? "public" : "private",
        }
      );

      const media = await storage.createMedia({
        ...mediaData,
        objectPath,
        userId,
      });
      
      res.status(201).json({ media });
    } catch (error) {
      console.error("Error creating media:", error);
      res.status(500).json({ error: "Failed to create media" });
    }
  });

  app.put("/api/media/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId!;
    
    try {
      const media = await storage.getMedia(id);
      if (!media) {
        return res.status(404).json({ error: "Media not found" });
      }
      
      if (media.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updatedMedia = await storage.updateMedia(id, req.body);
      res.json({ media: updatedMedia });
    } catch (error) {
      console.error("Error updating media:", error);
      res.status(500).json({ error: "Failed to update media" });
    }
  });

  app.delete("/api/media/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId!;
    
    try {
      const media = await storage.getMedia(id);
      if (!media) {
        return res.status(404).json({ error: "Media not found" });
      }
      
      if (media.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.deleteMedia(id);
      res.json({ message: "Media deleted successfully" });
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ error: "Failed to delete media" });
    }
  });

  // Album routes
  app.get("/api/albums", async (req, res) => {
    const { userId, public: isPublic } = req.query;
    
    try {
      let albums;
      
      if (userId && req.session.userId) {
        albums = await storage.getAlbumsByUserId(userId as string);
      } else if (isPublic) {
        albums = await storage.getPublicAlbums();
      } else {
        albums = req.session.userId 
          ? await storage.getAlbumsByUserId(req.session.userId)
          : await storage.getPublicAlbums();
      }
      
      res.json({ albums });
    } catch (error) {
      console.error("Error fetching albums:", error);
      res.status(500).json({ error: "Failed to fetch albums" });
    }
  });

  app.post("/api/albums", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    
    try {
      const albumData = insertAlbumSchema.parse(req.body);
      const album = await storage.createAlbum({ ...albumData, userId });
      res.status(201).json({ album });
    } catch (error) {
      console.error("Error creating album:", error);
      res.status(500).json({ error: "Failed to create album" });
    }
  });

  app.put("/api/albums/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId!;
    
    try {
      const album = await storage.getAlbum(id);
      if (!album) {
        return res.status(404).json({ error: "Album not found" });
      }
      
      if (album.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updatedAlbum = await storage.updateAlbum(id, req.body);
      res.json({ album: updatedAlbum });
    } catch (error) {
      console.error("Error updating album:", error);
      res.status(500).json({ error: "Failed to update album" });
    }
  });

  app.delete("/api/albums/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId!;
    
    try {
      const album = await storage.getAlbum(id);
      if (!album) {
        return res.status(404).json({ error: "Album not found" });
      }
      
      if (album.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.deleteAlbum(id);
      res.json({ message: "Album deleted successfully" });
    } catch (error) {
      console.error("Error deleting album:", error);
      res.status(500).json({ error: "Failed to delete album" });
    }
  });

  // API Key routes
  app.get("/api/api-keys", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    
    try {
      const apiKeys = await storage.getApiKeysByUserId(userId);
      // Don't return actual keys in list
      const safeApiKeys = apiKeys.map(key => ({
        ...key,
        key: key.key.substring(0, 8) + "..." + key.key.substring(key.key.length - 4)
      }));
      res.json({ apiKeys: safeApiKeys });
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  app.post("/api/api-keys", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    
    try {
      const apiKeyData = insertApiKeySchema.parse(req.body);
      const key = "pk_" + randomBytes(32).toString("hex");
      
      const apiKey = await storage.createApiKey({
        ...apiKeyData,
        userId,
        key,
      });
      
      res.status(201).json({ apiKey });
    } catch (error) {
      console.error("Error creating API key:", error);
      res.status(500).json({ error: "Failed to create API key" });
    }
  });

  app.delete("/api/api-keys/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId!;
    
    try {
      const apiKey = await storage.getApiKey(id);
      if (!apiKey || apiKey.userId !== userId) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      await storage.deleteApiKey(id);
      res.json({ message: "API key deleted successfully" });
    } catch (error) {
      console.error("Error deleting API key:", error);
      res.status(500).json({ error: "Failed to delete API key" });
    }
  });

  // Theme routes
  app.get("/api/themes", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    
    try {
      const themes = await storage.getThemesByUserId(userId);
      res.json({ themes });
    } catch (error) {
      console.error("Error fetching themes:", error);
      res.status(500).json({ error: "Failed to fetch themes" });
    }
  });

  app.post("/api/themes", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    
    try {
      const themeData = insertThemeSchema.parse(req.body);
      const theme = await storage.createTheme({ ...themeData, userId });
      res.status(201).json({ theme });
    } catch (error) {
      console.error("Error creating theme:", error);
      res.status(500).json({ error: "Failed to create theme" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const allMedia = await storage.getRecentMedia(1000);
      const allAlbums = await storage.getPublicAlbums();
      
      const stats = {
        totalUsers: users.length,
        totalMedia: allMedia.length,
        totalAlbums: allAlbums.length,
        storageUsed: allMedia.reduce((total, media) => total + media.size, 0),
        apiCalls: Math.floor(Math.random() * 100000), // Mock data
      };
      
      res.json({ stats });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json({ users: usersWithoutPasswords });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
