import { type User, type InsertUser, type Album, type InsertAlbum, type Media, type InsertMedia, type ApiKey, type InsertApiKey, type Theme, type InsertTheme } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Albums
  getAlbum(id: string): Promise<Album | undefined>;
  getAlbumsByUserId(userId: string): Promise<Album[]>;
  getPublicAlbums(): Promise<Album[]>;
  createAlbum(album: InsertAlbum & { userId: string }): Promise<Album>;
  updateAlbum(id: string, updates: Partial<Album>): Promise<Album | undefined>;
  deleteAlbum(id: string): Promise<boolean>;

  // Media
  getMedia(id: string): Promise<Media | undefined>;
  getMediaByUserId(userId: string): Promise<Media[]>;
  getMediaByAlbumId(albumId: string): Promise<Media[]>;
  getPublicMedia(): Promise<Media[]>;
  getRecentMedia(limit?: number): Promise<Media[]>;
  createMedia(media: InsertMedia & { userId: string }): Promise<Media>;
  updateMedia(id: string, updates: Partial<Media>): Promise<Media | undefined>;
  deleteMedia(id: string): Promise<boolean>;
  searchMedia(query: string, userId?: string): Promise<Media[]>;

  // API Keys
  getApiKey(key: string): Promise<ApiKey | undefined>;
  getApiKeysByUserId(userId: string): Promise<ApiKey[]>;
  createApiKey(apiKey: InsertApiKey & { userId: string; key: string }): Promise<ApiKey>;
  updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | undefined>;
  deleteApiKey(id: string): Promise<boolean>;

  // Themes
  getTheme(id: string): Promise<Theme | undefined>;
  getThemesByUserId(userId: string): Promise<Theme[]>;
  createTheme(theme: InsertTheme & { userId: string }): Promise<Theme>;
  updateTheme(id: string, updates: Partial<Theme>): Promise<Theme | undefined>;
  deleteTheme(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private albums: Map<string, Album> = new Map();
  private media: Map<string, Media> = new Map();
  private apiKeys: Map<string, ApiKey> = new Map();
  private themes: Map<string, Theme> = new Map();

  constructor() {
    // Create default admin user
    const adminId = randomUUID();
    const admin: User = {
      id: adminId,
      username: "admin",
      password: "$2b$10$zVV0VRof6E3bIy0dbAMpreN4VBSsygTb/BebwtHkyR9KJ6KMItW5K", // password: admin123
      email: "admin@photovault.com",
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(adminId, admin);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    console.log("Looking for user:", username);
    console.log("Available users:", Array.from(this.users.values()).map(u => u.username));
    const user = Array.from(this.users.values()).find(user => user.username === username);
    console.log("Found user:", user ? { username: user.username, id: user.id } : null);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || "user",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Albums
  async getAlbum(id: string): Promise<Album | undefined> {
    return this.albums.get(id);
  }

  async getAlbumsByUserId(userId: string): Promise<Album[]> {
    return Array.from(this.albums.values()).filter(album => album.userId === userId);
  }

  async getPublicAlbums(): Promise<Album[]> {
    return Array.from(this.albums.values()).filter(album => album.isPublic);
  }

  async createAlbum(insertAlbum: InsertAlbum & { userId: string }): Promise<Album> {
    const id = randomUUID();
    const album: Album = {
      ...insertAlbum,
      id,
      description: insertAlbum.description || null,
      isPublic: insertAlbum.isPublic || null,
      coverPhotoId: null,
      createdAt: new Date(),
    };
    this.albums.set(id, album);
    return album;
  }

  async updateAlbum(id: string, updates: Partial<Album>): Promise<Album | undefined> {
    const album = this.albums.get(id);
    if (!album) return undefined;
    
    const updatedAlbum = { ...album, ...updates };
    this.albums.set(id, updatedAlbum);
    return updatedAlbum;
  }

  async deleteAlbum(id: string): Promise<boolean> {
    return this.albums.delete(id);
  }

  // Media
  async getMedia(id: string): Promise<Media | undefined> {
    return this.media.get(id);
  }

  async getMediaByUserId(userId: string): Promise<Media[]> {
    return Array.from(this.media.values()).filter(media => media.userId === userId);
  }

  async getMediaByAlbumId(albumId: string): Promise<Media[]> {
    return Array.from(this.media.values()).filter(media => media.albumId === albumId);
  }

  async getPublicMedia(): Promise<Media[]> {
    return Array.from(this.media.values()).filter(media => media.isPublic);
  }

  async getRecentMedia(limit = 20): Promise<Media[]> {
    return Array.from(this.media.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  async createMedia(insertMedia: InsertMedia & { userId: string }): Promise<Media> {
    const id = randomUUID();
    const mediaItem: Media = {
      ...insertMedia,
      id,
      thumbnailPath: null,
      tags: insertMedia.tags || null,
      metadata: insertMedia.metadata || null,
      albumId: insertMedia.albumId || null,
      isPublic: insertMedia.isPublic || null,
      createdAt: new Date(),
    };
    this.media.set(id, mediaItem);
    return mediaItem;
  }

  async updateMedia(id: string, updates: Partial<Media>): Promise<Media | undefined> {
    const media = this.media.get(id);
    if (!media) return undefined;
    
    const updatedMedia = { ...media, ...updates };
    this.media.set(id, updatedMedia);
    return updatedMedia;
  }

  async deleteMedia(id: string): Promise<boolean> {
    return this.media.delete(id);
  }

  async searchMedia(query: string, userId?: string): Promise<Media[]> {
    const allMedia = Array.from(this.media.values());
    const searchableMedia = userId 
      ? allMedia.filter(media => media.userId === userId || media.isPublic)
      : allMedia.filter(media => media.isPublic);

    const queryLower = query.toLowerCase();
    return searchableMedia.filter(media => 
      media.originalName.toLowerCase().includes(queryLower) ||
      media.tags?.some(tag => tag.toLowerCase().includes(queryLower))
    );
  }

  // API Keys
  async getApiKey(key: string): Promise<ApiKey | undefined> {
    return Array.from(this.apiKeys.values()).find(apiKey => apiKey.key === key);
  }

  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values()).filter(apiKey => apiKey.userId === userId);
  }

  async createApiKey(insertApiKey: InsertApiKey & { userId: string; key: string }): Promise<ApiKey> {
    const id = randomUUID();
    const apiKey: ApiKey = {
      ...insertApiKey,
      id,
      permissions: insertApiKey.permissions || null,
      isActive: true,
      lastUsed: null,
      createdAt: new Date(),
    };
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | undefined> {
    const apiKey = this.apiKeys.get(id);
    if (!apiKey) return undefined;
    
    const updatedApiKey = { ...apiKey, ...updates };
    this.apiKeys.set(id, updatedApiKey);
    return updatedApiKey;
  }

  async deleteApiKey(id: string): Promise<boolean> {
    return this.apiKeys.delete(id);
  }

  // Themes
  async getTheme(id: string): Promise<Theme | undefined> {
    return this.themes.get(id);
  }

  async getThemesByUserId(userId: string): Promise<Theme[]> {
    return Array.from(this.themes.values()).filter(theme => theme.userId === userId);
  }

  async createTheme(insertTheme: InsertTheme & { userId: string }): Promise<Theme> {
    const id = randomUUID();
    const theme: Theme = {
      ...insertTheme,
      id,
      isDefault: insertTheme.isDefault || null,
      createdAt: new Date(),
    };
    this.themes.set(id, theme);
    return theme;
  }

  async updateTheme(id: string, updates: Partial<Theme>): Promise<Theme | undefined> {
    const theme = this.themes.get(id);
    if (!theme) return undefined;
    
    const updatedTheme = { ...theme, ...updates };
    this.themes.set(id, updatedTheme);
    return updatedTheme;
  }

  async deleteTheme(id: string): Promise<boolean> {
    return this.themes.delete(id);
  }
}

export const storage = new MemStorage();
