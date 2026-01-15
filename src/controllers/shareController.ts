import { Response } from 'express';
import { AuthRequest, CreateShareBody } from '../types/index.js';
import { Share } from '../models/index.js';

export class ShareController {
  // Create a share
  createShare = async (req: AuthRequest<{}, {}, CreateShareBody>, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { category, sharedWithUserId } = req.body;

      if (!category || !sharedWithUserId) {
        return res.status(400).json({ message: 'Category and user are required' });
      }

      // Check if already shared
      const existing = await Share.findOne({
        where: {
          ownerId: req.user.userId,
          category: category,
          sharedWithUserId: sharedWithUserId
        }
      });

      if (existing) {
        return res.status(409).json({ message: 'Already shared with this user' });
      }

      const share = await Share.create({
        id: Date.now(),
        ownerId: req.user.userId,
        category,
        sharedWithUserId,
        createdAt: new Date()
      });

      res.status(201).json({ 
        message: 'Folder shared successfully', 
        share 
      });
    } catch (err) {
      console.error('Error creating share:', err);
      res.status(500).json({ message: 'Failed to create share' });
    }
  };

  // You can add more share-related methods here:
  // - getShares (get all shares for a user)
  // - deleteShare (unshare a category)
}