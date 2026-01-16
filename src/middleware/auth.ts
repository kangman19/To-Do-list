import { Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthRequest } from '../types/index.js';

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (err) {
      return res.status(500).json({ message: 'Authentication error' });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  })(req, res, next);
};