import { Router } from 'express';
import { getAll, getByType, create, update, remove } from '../controllers/section-type.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getAll);
router.get('/:type', getByType);
router.post('/', authenticate, requireRole('admin', 'editor'), create);
router.patch('/:type', authenticate, requireRole('admin', 'editor'), update);
router.delete('/:type', authenticate, requireRole('admin'), remove);

export default router;
