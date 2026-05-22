import { Router } from 'express';
import { getAll, getById, getByToken, create, update, remove, addMedia, removeMedia, linkOdoo, syncOdooProjects } from '../controllers/client.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireRole('admin', 'editor'), getAll);
router.get('/token/:token', getByToken);
router.get('/:id', authenticate, requireRole('admin', 'editor'), getById);
router.post('/', authenticate, requireRole('admin', 'editor'), create);
router.patch('/:id', authenticate, requireRole('admin', 'editor'), update);
router.delete('/:id', authenticate, requireRole('admin'), remove);
router.post('/:id/media', authenticate, requireRole('admin', 'editor'), addMedia);
router.delete('/:id/media/:mediaId', authenticate, requireRole('admin', 'editor'), removeMedia);
router.post('/:id/link-odoo', authenticate, requireRole('admin', 'editor'), linkOdoo);
router.post('/:id/sync-odoo-projects', authenticate, requireRole('admin', 'editor'), syncOdooProjects);

export default router;
