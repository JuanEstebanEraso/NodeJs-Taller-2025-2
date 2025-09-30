import { Router } from 'express';
import { eventController } from '../controllers/event.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

// Protected routes for all authenticated users (e.g., players can view open events)
router.get('/', authenticateToken, authorizeRoles(['player', 'admin']), eventController.getOpenEvents);
router.get('/:id', authenticateToken, authorizeRoles(['player', 'admin']), eventController.getEventById);
router.get('/:id/status', authenticateToken, authorizeRoles(['player', 'admin']), eventController.checkEventStatus);

// Admin only routes
router.post('/', authenticateToken, authorizeRoles(['admin']), eventController.createEvent);
router.put('/:id/close', authenticateToken, authorizeRoles(['admin']), eventController.closeEvent);
router.get('/admin/all', authenticateToken, authorizeRoles(['admin']), eventController.getAllEvents);
router.put('/admin/:id', authenticateToken, authorizeRoles(['admin']), eventController.updateEvent);
router.delete('/admin/:id', authenticateToken, authorizeRoles(['admin']), eventController.deleteEvent);

export default router;