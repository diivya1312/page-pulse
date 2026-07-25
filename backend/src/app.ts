import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import analyzeRoutes from './routes/analyze.routes';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';

/**
 * Builds and returns a fully configured Express application.
 * Kept separate from server.ts (which handles listening on a port) so
 * Supertest can exercise the app in-memory during tests.
 */
export function createApp(): Application {
  const app = express();

  // Security headers on every response.
  app.use(helmet());

  // CORS — restrict to configured origin(s) in production, open in dev.
  const allowedOrigins = (process.env.CORS_ORIGIN || '*')
    .split(',')
    .map((o) => o.trim());
  app.use(
    cors({
      origin: allowedOrigins.includes('*') ? true : allowedOrigins,
    })
  );

  // Request logging — skip in test env to keep test output clean.
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'page-pulse-api', timestamp: new Date().toISOString() });
  });

  app.use('/api', analyzeRoutes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
