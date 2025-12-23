const mysql = require('mysql2/promise');
const path = require('path');

// Database configuration from environment variables or defaults
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.replace(/^["']|["']$/g, '') : '', // Remove quotes if present
  database: process.env.DB_NAME || 'guardian_vision',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
let pool;

async function initializeDatabase() {
  try {
    // First, connect without database to create it if it doesn't exist
    const tempConfig = { ...dbConfig };
    delete tempConfig.database;
    
    const tempConnection = await mysql.createConnection(tempConfig);
    
    // Create database if it doesn't exist
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await tempConnection.end();
    
    // Now create pool with database
    pool = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database:', dbConfig.database);
    
    // Enable foreign keys
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Create emergency_contacts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        relationship VARCHAR(100) NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        alert_methods TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Create alerts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        alert_type VARCHAR(100) NOT NULL,
        status ENUM('safe', 'warning', 'danger') NOT NULL,
        confidence INT NOT NULL DEFAULT 0,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        camera_id VARCHAR(100),
        camera_name VARCHAR(255),
        action_taken TEXT NOT NULL,
        contacts_notified JSON DEFAULT ('[]'),
        alert_results JSON DEFAULT ('[]'),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Create user_settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) UNIQUE NOT NULL,
        detection_sensitivity VARCHAR(50) NOT NULL DEFAULT 'high',
        confidence_threshold INT NOT NULL DEFAULT 75,
        realtime_processing TINYINT(1) NOT NULL DEFAULT 1,
        video_quality VARCHAR(50) NOT NULL DEFAULT 'hd',
        frame_rate INT NOT NULL DEFAULT 30,
        auto_start_detection TINYINT(1) NOT NULL DEFAULT 0,
        audio_alerts TINYINT(1) NOT NULL DEFAULT 1,
        alert_volume INT NOT NULL DEFAULT 85,
        auto_notify_contacts TINYINT(1) NOT NULL DEFAULT 1,
        quiet_hours_enabled TINYINT(1) NOT NULL DEFAULT 0,
        quiet_hours_start VARCHAR(10) NOT NULL DEFAULT '22:00',
        quiet_hours_end VARCHAR(10) NOT NULL DEFAULT '08:00',
        quiet_hours_days JSON DEFAULT ('["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]'),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    connection.release();
    console.log('Database tables initialized successfully');
    
    return pool;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Initialize database and export pool
let dbPromise = initializeDatabase();

module.exports = dbPromise;
