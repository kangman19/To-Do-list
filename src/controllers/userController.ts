import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../types/index.js';
import { User } from '../models/index.js';

export class UserController {
  // Get current user info
  getCurrentUser = async (req: AuthRequest, res: Response) => {
    try {
      res.json({
        userId: req.user.userId,
        username: req.user.username
      });
    } catch (err) {
      console.error('Error fetching current user:', err);
      res.status(500).json({ message: 'Failed to fetch user info' });
    }
  };

  // Get all users (for sharing)
  getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
      const users = await User.findAll({
        where: {
          id: { [Op.ne]: req.user.userId }
        },
        attributes: ['id', 'username']
      });

      res.json(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  };

  // Logout (client-side token removal)
  logout = async (req: AuthRequest, res: Response) => {
    res.json({ message: 'Logged out successfully' });
  };
}