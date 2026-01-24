import { Router } from 'express';
import { ReminderController } from '../controllers/reminderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const reminderController = new ReminderController();

export const createReminderRouter = () => {
  return router;
}

// All routes require authentication
//?nice authentication middleware applied globally to this router
router.use(requireAuth);

// GET /api/reminders/unread - Get user's unread reminders
router.get('/unread', reminderController.getUnreadReminders);

// POST /api/reminders - Send a reminder
router.post('/', reminderController.sendReminder);

// POST /api/reminders/:reminderId/read - Mark reminder as read
router.post('/:reminderId/read', reminderController.markAsRead);

export default router;