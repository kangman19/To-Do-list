import { Request } from 'express';
import { Socket } from 'socket.io';

export interface JwtPayload {
  userId: number;
  username: string;
  iat?: number;
  exp?: number;
}
export interface AuthenticatedSocket extends Socket {
  userId?: number;
  username?: string;
}

export interface AuthRequest<P = {}, ResBody = any, ReqBody = any, ReqQuery = {}> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: JwtPayload;
}
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

export interface TasksByCategory {
  [category: string]: {
    tasks: TaskWithUser[];
    shared: boolean;
    sharedBy: string | null;
  };
}

export interface CreateTaskBody{
  task: string;
  category?: string;
  ownerId?: number;
  taskByCategory?: TasksByCategory[];
}

export interface CreateShareBody {
  sharedWithUserId: number;
  title: string;
  description?: string;
  category?: string;
}
// This tells Express what the user object looks like 
declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}
