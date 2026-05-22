import { Router } from 'express';
import { assign, remove } from '../controllers/timeEntryMedia.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.post('/time-entries/:timeEntryId/media', authenticate, requireRole('admin', 'editor'), assign);
router.delete('/time-entries/:timeEntryId/media/:mediaId', authenticate, requireRole('admin', 'editor'), remove);

export default router;
