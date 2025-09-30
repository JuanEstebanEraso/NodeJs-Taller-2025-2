import { Router } from 'express';
import { betController } from '../controllers/bet.controller';
import { authenticateToken, requireAdmin, requirePlayer } from '../middleware/auth.middleware';

const router = Router();

// Player routes (authentication required)
router.post('/', authenticateToken, requirePlayer, betController.createBet);
router.get('/my-bets', authenticateToken, requirePlayer, betController.getUserBets);
router.get('/my-stats', authenticateToken, requirePlayer, betController.getUserBetStats);

// Admin only routes
router.post('/event/:eventId/process', authenticateToken, requireAdmin, betController.processBetsForEvent);
router.get('/event/:eventId', authenticateToken, requireAdmin, betController.getEventBets);
router.get('/admin/all', authenticateToken, requireAdmin, betController.getAllBets);
router.put('/admin/:id/status', authenticateToken, requireAdmin, betController.updateBetStatus);
router.delete('/admin/:id', authenticateToken, requireAdmin, betController.deleteBet);

export default router;