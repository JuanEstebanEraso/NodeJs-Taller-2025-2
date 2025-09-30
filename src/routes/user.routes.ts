import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

// Public routes (no authentication required)
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes for authenticated users
router.get('/profile', authenticateToken, authorizeRoles(['player', 'admin']), userController.getProfile);
router.get('/:id', authenticateToken, authorizeRoles(['player', 'admin']), userController.getUserById);
router.put('/:id/balance', authenticateToken, authorizeRoles(['player', 'admin']), userController.updateBalance);
router.get('/:id/balance/check', authenticateToken, authorizeRoles(['player', 'admin']), userController.checkBalance);

// Admin only routes
router.get('/', authenticateToken, authorizeRoles(['admin']), userController.getAllUsers);
router.post('/', authenticateToken, authorizeRoles(['admin']), userController.createUser);
router.put('/:id', authenticateToken, authorizeRoles(['admin']), userController.updateUser);
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), userController.deleteUser);

export default router;