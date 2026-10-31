import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { profileRouter } from './routes/profile';
import { authRouter } from './routes/auth';
import { wardrobeRouter } from './routes/wardrobe';
import { outfitsRouter } from './routes/outfits';
import { analysisRouter } from './routes/analysis';
import { aiRouter } from './routes/ai';
import { dashboardRouter } from './routes/dashboard';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI rate limit exceeded. Please wait before making more requests.' },
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'StyleGuru API' });
});

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1', profileRouter);
app.use('/api/v1', wardrobeRouter);
app.use('/api/v1', outfitsRouter);
app.use('/api/v1/analysis', aiLimiter, analysisRouter);
app.use('/api/v1/ai', aiLimiter, aiRouter);
app.use('/api/v1', dashboardRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

app.listen(PORT, () => {
  console.log(`StyleGuru API running on port ${PORT}`);
});

export default app;

