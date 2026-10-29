const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then listen
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[SHOPEZ Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('\n[SHOPEZ Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[SHOPEZ Server] Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('[SHOPEZ Server] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
