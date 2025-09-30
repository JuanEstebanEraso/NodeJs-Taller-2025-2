import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/profile', authenticateToken, userController.getProfile);
router.get('/:id', authenticateToken, userController.getUserById);
router.put('/:id/balance', authenticateToken, userController.updateBalance);
router.get('/:id/balance/check', authenticateToken, userController.checkBalance);

router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);
router.post('/', authenticateToken, requireAdmin, userController.createUser);
router.put('/:id', authenticateToken, requireAdmin, userController.updateUser);
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

export default router;