import app from './app.js';
import { env } from './config/env.js';
import { testConnection } from './config/db.js';
import { verifyEmailConfig } from './config/email.js';
import { initializeAdmin } from './utils/init-admin.js';

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Initialize admin user
    await initializeAdmin();

    // Verify email configuration (optional - won't block server start)
    await verifyEmailConfig();

    // Start server
    app.listen(env.PORT, () => {
      console.log(`🚀 Server is running on port ${env.PORT}`);
      console.log(`📍 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 API URL: http://localhost:${env.PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
