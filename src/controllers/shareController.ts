import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { Share } from '../models/index.js';

export class ShareController {
  // Create a share
  createShare = async (req: AuthRequest, res: Response) => {
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

  // Delete a share 
  deleteShare = async (req: AuthRequest<{ shareId: string }>, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const shareId = parseInt(req.params.shareId);
      
      const share = await Share.findOne({
        where: {
          id: shareId,
          ownerId: req.user.userId
        }
      });

      if (!share) {
        return res.status(404).json({ message: 'Share not found' });
      }

      await share.destroy();
      res.json({ message: 'Share deleted successfully' });
    } catch (err) {
      console.error('Error deleting share:', err);
      res.status(500).json({ message: 'Failed to delete share' });
    }
  };
}