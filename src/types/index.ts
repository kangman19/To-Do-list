import { Request } from 'express';
import { Socket } from 'socket.io';


export interface JwtPayload {
  userId: number;
  username: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest<
  P = {},
  ResBody = any,
  ReqBody = any,
  ReqQuery = {}
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: JwtPayload;
}

// Tell Express what req.user looks like 
declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}

export interface AuthenticatedSocket extends Socket {
  userId?: number;
  username?: string;
}

//User types

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

//task types

export interface TaskWithUser {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  completedAt: Date | null;
  completedById: number | null;
  userId: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  username: string;
  completedBy: string | null;
}

// sequelize task types
export interface TaskAttributes {
  id: number;
  userId: number;
  task: string;
  category: string;
  createdAt: Date;
  completed: boolean;
  completedAt: Date | null;
  completedById: number | null;
  taskType?: string; // 'list' | 'text' | 'image'
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
}


export interface TasksByCategory {
  [category: string]: {
    tasks: TaskWithUser[];
    shared: boolean;
    sharedBy: string | null;
  };
}
// Share types
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


export interface CreateTaskBody {
  task: string;
  category?: string;
  ownerId?: number;
  taskType?: string;
  taskByCategory?: TasksByCategory[];
}

export interface CreateShareBody {
  sharedWithUserId: number;
  title?: string;
  description?: string;
  category?: string;
}

export interface CreateReminderBody {
  taskId: number;
  remindedUserId: number;
  message?: string;
}

export interface SignupBody {
  username: string;
  password: string;
  email?: string;
}

export interface LoginBody {
  username: string;
  password: string;
}
