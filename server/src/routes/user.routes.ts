import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/user.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireRole('admin', 'editor'), getAll);
router.get('/:id', authenticate, requireRole('admin', 'editor'), getById);
router.post('/', authenticate, requireRole('admin'), create);
router.patch('/:id', authenticate, requireRole('admin'), update);
router.delete('/:id', authenticate, requireRole('admin'), remove);

export default router;
