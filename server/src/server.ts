import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { env } from './utils/env';
import { ensureBuckets } from './services/minio.service';
import { startTelegramBot } from './services/telegram.service';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import pageRoutes from './routes/page.routes';
import sectionRoutes from './routes/section.routes';
import mediaRoutes from './routes/media.routes';
import clientRoutes from './routes/client.routes';
import videoRoutes from './routes/video.routes';
import sectionTypeRoutes from './routes/section-type.routes';
import odooRoutes from './routes/odoo.routes';
import projectRoutes from './routes/project.routes';
import commentRoutes from './routes/comment.routes';
import timeEntryRoutes from './routes/timeEntry.routes';
import projectMediaRoutes from './routes/projectMedia.routes';
import timeEntryMediaRoutes from './routes/timeEntryMedia.routes';

const app = express();
const PORT = parseInt(env.PORT, 10);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://fjrservices.com']
    : ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/api/media/') && req.method === 'GET',
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/section-types', sectionTypeRoutes);
app.use('/api/odoo', odooRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/time-entries', timeEntryRoutes);
app.use('/api/project-media', projectMediaRoutes);
app.use('/api/time-entry-media', timeEntryMediaRoutes);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Start server
async function start() {
  try {
    await ensureBuckets();
    console.log('MinIO buckets ready');
  } catch {
    console.warn('MinIO not available, skipping bucket setup');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  // Start Telegram bot (non-blocking)
  startTelegramBot();
}

start();
