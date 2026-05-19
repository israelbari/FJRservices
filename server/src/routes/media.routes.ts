import { Router } from 'express';
import multer from 'multer';
import { getAll, getById, upload, uploadZip, update, getUrl, remove } from '../controllers/media.controller';
import { authenticate, requireRole } from '../middleware/auth';

const uploadMiddleware = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get('/', getAll);
router.get('/:id', getById);
router.get('/:id/url', getUrl);
router.post('/', authenticate, requireRole('admin', 'editor'), uploadMiddleware.single('file'), upload);
router.post('/upload-zip', authenticate, requireRole('admin', 'editor'), uploadMiddleware.single('file'), uploadZip);
router.patch('/:id', authenticate, requireRole('admin', 'editor'), update);
router.delete('/:id', authenticate, requireRole('admin', 'editor'), remove);

export default router;
