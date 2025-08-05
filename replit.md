# PhotoVault - Full-Stack Photo Management Application

## Overview

PhotoVault is a comprehensive full-stack photo and video management application built with a modern tech stack. The application provides a complete media management solution with features including photo/video upload, album organization, user authentication, admin controls, API management, and theme customization. It's designed as a personal or team photo vault with role-based access control and cloud storage integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in a Vite-powered SPA
- **UI System**: Shadcn/ui component library with Radix UI primitives for accessible, composable components
- **Styling**: Tailwind CSS with CSS custom properties for theming support (light, dark, nature themes)
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **File Upload**: Uppy.js with dashboard UI for advanced file upload capabilities including progress tracking and S3 integration

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express-session for authentication state
- **Password Security**: bcrypt for password hashing
- **Database Access**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **File Storage**: Google Cloud Storage integration via official SDK with custom ACL (Access Control List) system for fine-grained permissions

### Database Design
- **Schema**: PostgreSQL with Drizzle ORM defining tables for users, albums, media, API keys, and themes
- **Relationships**: Foreign key relationships between users and their content (albums, media, API keys)
- **Features**: UUID primary keys, timestamps, JSON metadata storage, array fields for tags and permissions

### Authentication & Authorization
- **Session-based Authentication**: Server-side sessions with role-based access control (user/admin roles)
- **API Key System**: Programmatic access via generated API keys with configurable permissions (read/write/admin)
- **Middleware Protection**: Route-level authentication and authorization middleware

### File Management System
- **Cloud Storage**: Google Cloud Storage with Replit sidecar authentication for seamless cloud integration
- **Object ACL**: Custom access control layer supporting group-based permissions (user lists, email domains, group membership, subscriptions)
- **Media Processing**: Support for photos and videos with thumbnail generation and metadata extraction
- **Public/Private**: Configurable visibility settings for albums and individual media items

### Development Environment
- **Monorepo Structure**: Organized into client/, server/, and shared/ directories for clean separation of concerns
- **Build System**: Vite for frontend bundling with esbuild for server compilation
- **Development Tools**: Hot module replacement, TypeScript checking, and Replit-specific development enhancements
- **Path Aliases**: Configured import aliases for clean module resolution (@/, @shared/)

### API Architecture
- **RESTful Design**: Express routes organized by resource type (auth, media, albums, admin, API keys)
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Request Logging**: Comprehensive request/response logging for development and debugging
- **CORS & Security**: Production-ready security configurations

## External Dependencies

### Cloud Services
- **Google Cloud Storage**: Primary file storage backend with automatic authentication via Replit sidecar
- **Neon Database**: PostgreSQL database service with Drizzle ORM integration
- **Replit Platform**: Development environment with integrated database and storage services

### File Upload & Media
- **Uppy Ecosystem**: Complete file upload solution with AWS S3 compatibility, dashboard UI, and progress tracking
- **Image/Video Processing**: Client-side preview generation and metadata extraction

### UI & Styling
- **Radix UI**: Accessible component primitives for dialogs, dropdowns, navigation, and form controls
- **Tailwind CSS**: Utility-first styling with PostCSS processing and custom theme variables
- **Lucide Icons**: Comprehensive icon library for consistent visual design

### Development & Build Tools
- **Vite**: Fast development server and build tool with React plugin and runtime error handling
- **TypeScript**: Full type safety across frontend, backend, and shared code
- **Drizzle Kit**: Database migration and schema management tools