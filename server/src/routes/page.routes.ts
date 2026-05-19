import { Router } from 'express';
import { getAll, getBySlug, getById, create, update, remove } from '../controllers/page.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getAll);
router.get('/slug/:slug', getBySlug);
router.get('/:id', getById);
router.post('/', authenticate, requireRole('admin', 'editor'), create);
router.patch('/:id', authenticate, requireRole('admin', 'editor'), update);
router.delete('/:id', authenticate, requireRole('admin'), remove);

export default router;
