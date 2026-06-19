const app = require('./app');
const connectDB = require('./config/db');
const { port, nodeEnv } = require('./config/env');

connectDB();

const server = app.listen(port, () => {
  console.log(`Server running in ${nodeEnv} mode on port ${port}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
