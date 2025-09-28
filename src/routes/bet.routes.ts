import { Router } from 'express';
import { BetController } from '../controllers/bet.controller';
import { authenticateToken, requireAdmin, requirePlayer } from '../middleware/auth.middleware';

const router = Router();

// Player routes (authentication required)
router.post('/', authenticateToken, requirePlayer, BetController.createBet);
router.get('/my-bets', authenticateToken, requirePlayer, BetController.getUserBets);
router.get('/my-stats', authenticateToken, requirePlayer, BetController.getUserBetStats);

// Admin only routes
router.post('/event/:eventId/process', authenticateToken, requireAdmin, BetController.processBetsForEvent);
router.get('/event/:eventId', authenticateToken, requireAdmin, BetController.getEventBets);

export default router;