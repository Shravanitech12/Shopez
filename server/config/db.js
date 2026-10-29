const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopez';

  try {
    // Attempt standard connection with 3-second timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      autoIndex: true,
    });
    console.log(`[Database] MongoDB Connected to host: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Warning: Could not connect to primary MongoDB at "${uri}": ${err.message}`);
    console.log('[Database] Starting standalone embedded MongoDB server for seamless zero-config operation...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const dbPath = path.join(__dirname, '..', '.mongo_storage');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      memoryServer = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'shopez',
          storageEngine: 'wiredTiger',
          dbPath: dbPath,
        },
      });

      const memUri = memoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] Embedded MongoDB Server running at: ${memUri}`);
      return conn;
    } catch (memErr) {
      // If port 27017 in use or storageEngine issue, fallback to dynamic in-memory instance
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'shopez',
          },
        });
        const dynamicUri = memoryServer.getUri();
        const conn = await mongoose.connect(dynamicUri);
        console.log(`[Database] In-memory MongoDB Server running at: ${dynamicUri}`);
        return conn;
      } catch (finalErr) {
        console.error('[Database] Fatal: Unable to initialize any MongoDB instance.', finalErr);
        process.exit(1);
      }
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
