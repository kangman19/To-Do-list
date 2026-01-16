import { Response } from 'express';
import { AuthRequest, CreateReminderBody } from '../types/index.js';
import { Reminder, Task, User } from '../models/index.js';

export class ReminderController {
  // Send a reminder
  sendReminder = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { receiverId, category, message } = req.body;

      if (!receiverId || !category) {
        return res.status(400).json({ message: 'Receiver and category are required' });
      }

      const reminder = await Reminder.create({
        id: Date.now(),
        senderId: req.user.userId,
        receiverId: parseInt(receiverId),
        category,
        message: message || null,
        isRead: false,
        createdAt: new Date()
      });

      res.status(201).json({ 
        message: 'Reminder sent successfully', 
        reminder 
      });
    } catch (err) {
      console.error('Error sending reminder:', err);
      res.status(500).json({ message: 'Failed to send reminder' });
    }
  };

  // Get unread reminders for current user
  getUnreadReminders = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const reminders = await Reminder.findAll({
        where: {
          receiverId: req.user.userId,
          isRead: false
        },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['username']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json(reminders);
    } catch (err) {
      console.error('Error fetching reminders:', err);
      res.status(500).json({ message: 'Failed to fetch reminders' });
    }
  };

  // Mark reminder as read
  markAsRead = async (req: AuthRequest<{ reminderId: string }>, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const reminderId = parseInt(req.params.reminderId);

      const reminder = await Reminder.findOne({
        where: {
          id: reminderId,
          receiverId: req.user.userId
        }
      });

      if (!reminder) {
        return res.status(404).json({ message: 'Reminder not found' });
      }

      reminder.isRead = true;
      await reminder.save();

      res.json({ message: 'Reminder marked as read' });
    } catch (err) {
      console.error('Error marking reminder as read:', err);
      res.status(500).json({ message: 'Failed to mark reminder as read' });
    }
  };
}