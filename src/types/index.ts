import { Request } from 'express';
import SocketIO from 'socket.io';

// JWT Payload interface
export interface JwtPayload {
  userId: number;
  username: string;
  iat?: number;
  exp?: number;
}

// AuthUser is what req.user should contain after authentication
export interface AuthUser {
  userId: number;
  username: string;
}

// Extend Express Request to include user from JWT
export interface AuthRequest<
  P = {},
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user: AuthUser;
}

// User interfaces
export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes {
  username: string;
  email: string;
  password: string;
}

// Task interfaces
export interface TaskAttributes {
  id: number;
  userId: number;
  task: string;
  category: string;
  createdAt: Date;
  completed: boolean;
  completedAt: Date | null;
  completedById: number | null;
  taskType?: string; // 'list', 'text', 'image'
  imageUrl?: string | null;
}

export interface TaskCreationAttributes {
  id: number;
  userId: number;
  task: string;
  category: string;
  createdAt: Date;
  completed: boolean;
  completedAt: Date | null;
  completedById: number | null;
  taskType?: string;
  imageUrl?: string | null;
}

export interface TaskWithUser extends TaskAttributes {
  username?: string;
  completedBy?: string | null;
}

// Share interfaces
export interface ShareAttributes {
  id: number;
  ownerId: number;
  category: string;
  sharedWithUserId: number;
  createdAt: Date;
}

export interface ShareCreationAttributes {
  id: number;
  ownerId: number;
  category: string;
  sharedWithUserId: number;
  createdAt: Date;
}

// Category data structure
export interface CategoryData {
  tasks: TaskWithUser[];
  shared: boolean;
  sharedBy: string | null;
}

export interface TasksByCategory {
  [category: string]: CategoryData;
}

// Socket interfaces
export interface AuthenticatedSocket extends SocketIO.Socket {
  userId?: number;
  username?: string;
}

// Request body interfaces
export interface SignupBody {
  username: string;
  password: string;
  email?: string;
}

export interface LoginBody {
  username: string;
  password: string;
}

export interface CreateTaskBody {
  task: string;
  category: string;
  ownerId?: number;
  taskType?: string;
}

export interface CreateShareBody {
  category: string;
  sharedWithUserId: number;
}

export interface CreateReminderBody {
  taskId: number;
  remindedUserId: number;
  message?: string;
}