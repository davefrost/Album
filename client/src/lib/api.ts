import { apiRequest } from "./queryClient";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  objectPath: string;
  thumbnailPath?: string;
  type: "photo" | "video";
  userId: string;
  albumId?: string;
  tags?: string[];
  metadata?: any;
  isPublic: boolean;
  createdAt: string;
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  userId: string;
  coverPhotoId?: string;
  isPublic: boolean;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  lastUsed?: string;
  createdAt: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: any;
  settings: any;
  isDefault: boolean;
  createdAt: string;
}

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest) => {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  },
  
  logout: async () => {
    const response = await apiRequest("POST", "/api/auth/logout");
    return response.json();
  },
  
  getMe: async () => {
    const response = await apiRequest("GET", "/api/auth/me");
    return response.json();
  },
};

// Media API
export const mediaApi = {
  getUploadUrl: async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    return response.json();
  },
  
  createMedia: async (data: any) => {
    const response = await apiRequest("POST", "/api/media", data);
    return response.json();
  },
  
  getMedia: async (params?: { albumId?: string; userId?: string; public?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.albumId) searchParams.set("albumId", params.albumId);
    if (params?.userId) searchParams.set("userId", params.userId);
    if (params?.public) searchParams.set("public", "true");
    
    const url = `/api/media${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await apiRequest("GET", url);
    return response.json();
  },
  
  searchMedia: async (query: string) => {
    const response = await apiRequest("GET", `/api/media/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },
  
  updateMedia: async (id: string, data: any) => {
    const response = await apiRequest("PUT", `/api/media/${id}`, data);
    return response.json();
  },
  
  deleteMedia: async (id: string) => {
    const response = await apiRequest("DELETE", `/api/media/${id}`);
    return response.json();
  },
};

// Album API
export const albumApi = {
  getAlbums: async (params?: { userId?: string; public?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.set("userId", params.userId);
    if (params?.public) searchParams.set("public", "true");
    
    const url = `/api/albums${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await apiRequest("GET", url);
    return response.json();
  },
  
  createAlbum: async (data: any) => {
    const response = await apiRequest("POST", "/api/albums", data);
    return response.json();
  },
  
  updateAlbum: async (id: string, data: any) => {
    const response = await apiRequest("PUT", `/api/albums/${id}`, data);
    return response.json();
  },
  
  deleteAlbum: async (id: string) => {
    const response = await apiRequest("DELETE", `/api/albums/${id}`);
    return response.json();
  },
};

// API Key API
export const apiKeyApi = {
  getApiKeys: async () => {
    const response = await apiRequest("GET", "/api/api-keys");
    return response.json();
  },
  
  createApiKey: async (data: any) => {
    const response = await apiRequest("POST", "/api/api-keys", data);
    return response.json();
  },
  
  deleteApiKey: async (id: string) => {
    const response = await apiRequest("DELETE", `/api/api-keys/${id}`);
    return response.json();
  },
};

// Theme API
export const themeApi = {
  getThemes: async () => {
    const response = await apiRequest("GET", "/api/themes");
    return response.json();
  },
  
  createTheme: async (data: any) => {
    const response = await apiRequest("POST", "/api/themes", data);
    return response.json();
  },
};

// Admin API
export const adminApi = {
  getStats: async () => {
    const response = await apiRequest("GET", "/api/admin/stats");
    return response.json();
  },
  
  getUsers: async () => {
    const response = await apiRequest("GET", "/api/admin/users");
    return response.json();
  },
};
