import { Router } from 'express';
import { ReminderController } from '../controllers/reminderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const reminderController = new ReminderController();

// Get unread reminders
router.get('/unread', requireAuth, reminderController.getUnreadReminders);

// Send a reminder
router.post('/', requireAuth, reminderController.sendReminder);

// Mark reminder as read
router.post('/:id/read', requireAuth, reminderController.markAsRead);

export default router;