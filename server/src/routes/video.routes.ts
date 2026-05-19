import { Router } from 'express';
import multer from 'multer';
import { getAll, create, update, remove } from '../controllers/video.controller';
import { authenticate, requireRole } from '../middleware/auth';

const uploadMiddleware = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get('/', getAll);
router.post('/', authenticate, requireRole('admin', 'editor'), uploadMiddleware.single('file'), create);
router.patch('/:id', authenticate, requireRole('admin', 'editor'), uploadMiddleware.single('file'), update);
router.delete('/:id', authenticate, requireRole('admin', 'editor'), remove);

export default router;
