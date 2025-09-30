import { Router } from 'express';
import { betController } from '../controllers/bet.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

// Player routes (authentication required)
router.post('/', authenticateToken, authorizeRoles(['player']), betController.createBet);
router.get('/my-bets', authenticateToken, authorizeRoles(['player']), betController.getUserBets);
router.get('/my-stats', authenticateToken, authorizeRoles(['player']), betController.getUserBetStats);

// Admin only routes
router.post('/event/:eventId/process', authenticateToken, authorizeRoles(['admin']), betController.processBetsForEvent);
router.get('/event/:eventId', authenticateToken, authorizeRoles(['admin']), betController.getEventBets);
router.get('/admin/all', authenticateToken, authorizeRoles(['admin']), betController.getAllBets);
router.put('/admin/:id/status', authenticateToken, authorizeRoles(['admin']), betController.updateBetStatus);
router.delete('/admin/:id', authenticateToken, authorizeRoles(['admin']), betController.deleteBet);

export default router;