import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { sequelize } from '../models/index.js';
import { QueryTypes } from 'sequelize';

export class ReminderController {
  // Get unread reminders for current user
  getUnreadReminders = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userId = req.user.userId;
      console.log('Fetching unread reminders for user:', userId);

      const reminders = await sequelize.query(
        `SELECT 
          r.id,
          r.senderId,
          r.receiverId,
          r.category,
          r.message,
          r.isRead,
          r.createdAt,
          u.username as senderUsername
        FROM reminders r
        INNER JOIN users u ON r.senderId = u.id
        WHERE r.receiverId = :userId AND r.isRead = 0
        ORDER BY r.createdAt DESC`,
        {
          replacements: { userId },
          type: QueryTypes.SELECT
        }
      );

      console.log('Found reminders:', reminders.length);
      res.json(reminders);
    } catch (err) {
      console.error('Error fetching reminders:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : err);
      res.status(500).json({ 
        message: 'Failed to fetch reminders',
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  };

  // Send a reminder
  sendReminder = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const senderId = req.user.userId;
      const { receiverId, category, message } = req.body;

      console.log('Sending reminder:', { senderId, receiverId, category, message });

      if (!receiverId || !category) {
        return res.status(400).json({ message: 'Receiver and category are required' });
      }

      // Parse receiverId to ensure it's a number
      const receiverIdNum = parseInt(receiverId);

      if (isNaN(receiverIdNum)) {
        return res.status(400).json({ message: 'Invalid receiver ID' });
      }

      // Verify receiver exists
      const users = await sequelize.query(
        'SELECT id FROM users WHERE id = :receiverId',
        {
          replacements: { receiverId: receiverIdNum },
          type: QueryTypes.SELECT
        }
      );

      if (users.length === 0) {
        console.log('Receiver not found:', receiverIdNum);
        return res.status(404).json({ message: 'Receiver not found' });
      }

      // Don't allow sending reminders to yourself
      if (senderId === receiverIdNum) {
        return res.status(400).json({ message: 'Cannot send reminder to yourself' });
      }

      // Insert reminder - let MySQL auto-generate the ID
      await sequelize.query(
        `INSERT INTO reminders (senderId, receiverId, category, message, isRead, createdAt)
         VALUES (:senderId, :receiverId, :category, :message, 0, NOW())`,
        {
          replacements: {
            senderId,
            receiverId: receiverIdNum,
            category,
            message: message || null
          },
          type: QueryTypes.INSERT
        }
      );

      console.log('Reminder created successfully');
      res.status(201).json({ message: 'Reminder sent successfully' });
    } catch (err) {
      console.error('Error sending reminder:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : err);
      res.status(500).json({ 
        message: 'Failed to send reminder',
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  };

  // Mark reminder as read
  markAsRead = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userId = req.user.userId;
      const reminderId = parseInt((req.params as any).id);

      console.log('Marking reminder as read:', reminderId, 'for user:', userId);

      if (isNaN(reminderId)) {
        return res.status(400).json({ message: 'Invalid reminder ID' });
      }

      // Update reminder
      const result = await sequelize.query(
        `UPDATE reminders 
         SET isRead = 1 
         WHERE id = :reminderId AND receiverId = :userId`,
        {
          replacements: { reminderId, userId },
          type: QueryTypes.UPDATE
        }
      );

      // Check if any rows were affected
      const affectedRows = (result as any)[1] || 0;
      
      if (affectedRows === 0) {
        console.log('Reminder not found or not owned by user');
        return res.status(404).json({ message: 'Reminder not found' });
      }

      console.log('Reminder marked as read successfully');
      res.json({ message: 'Reminder marked as read' });
    } catch (err) {
      console.error('Error marking reminder as read:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : err);
      res.status(500).json({ 
        message: 'Failed to mark reminder as read',
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  };
}