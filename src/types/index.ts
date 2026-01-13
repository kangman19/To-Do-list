import { Request } from 'express';

export interface JwtPayload {
  userId: number;
  username: string;
  iat?: number;
  exp?: number;
}
// This tells Express what the user object looks like 
declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}

//Make AuthRequest generic to accept route params, body, etc.
export interface AuthRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: JwtPayload;
}