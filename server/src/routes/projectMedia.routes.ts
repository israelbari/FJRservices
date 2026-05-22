import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { assign, remove, toggleVisible } from '../controllers/projectMedia.controller';

const router = Router();

router.post('/project/:projectId', authenticate, requireRole('admin', 'editor'), assign);
router.delete('/project/:projectId/media/:mediaId', authenticate, requireRole('admin', 'editor'), remove);
router.patch('/:id', authenticate, requireRole('admin', 'editor'), toggleVisible);

export default router;
