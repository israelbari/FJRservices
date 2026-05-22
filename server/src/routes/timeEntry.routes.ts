import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { getByProject, create, update, remove } from '../controllers/timeEntry.controller';

const router = Router();

router.get('/project/:projectId', authenticate, requireRole('admin', 'editor'), getByProject);
router.post('/project/:projectId', authenticate, requireRole('admin', 'editor'), create);
router.patch('/:id', authenticate, requireRole('admin', 'editor'), update);
router.delete('/:id', authenticate, requireRole('admin', 'editor'), remove);

export default router;
