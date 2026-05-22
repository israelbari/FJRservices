import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { getByClient, create, update, remove } from '../controllers/project.controller';

const router = Router();

router.get('/client/:clientId', authenticate, requireRole('admin', 'editor'), getByClient);
router.post('/client/:clientId', authenticate, requireRole('admin', 'editor'), create);
router.patch('/:id', authenticate, requireRole('admin', 'editor'), update);
router.delete('/:id', authenticate, requireRole('admin'), remove);

export default router;
