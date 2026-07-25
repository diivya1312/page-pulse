import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';

const PORT = Number(process.env.PORT) || 5000;

const app = createApp();

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Page Pulse API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// Graceful shutdown — important for platforms like Render that send SIGTERM.
process.on('SIGTERM', () => {
  // eslint-disable-next-line no-console
  console.log('SIGTERM received: closing server gracefully.');
  server.close(() => process.exit(0));
});

// Last-resort safety nets so a single bad promise/exception never
// silently kills the process (spec requirement: "Never crash").
process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('Uncaught Exception:', err);
});
