import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

export const initializeAdmin = async () => {
  try {
    // Check if admin exists
    const [existingAdmin] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      ['admin@elimar.com']
    );

    if (Array.isArray(existingAdmin) && existingAdmin.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin123', 10);
    
    await pool.execute(
      `INSERT INTO users (name, email, password, role, email_verified) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Admin', 'admin@elimar.com', hashedPassword, 'admin', true]
    );

    console.log('✅ Admin user created successfully');
    console.log('   Email: admin@elimar.com');
    console.log('   Password: Admin123');
  } catch (error) {
    console.error('❌ Failed to initialize admin:', error);
  }
};
