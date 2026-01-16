/* FOR LATER USE
import { sequelize } from '../models/index.js';

async function runMigration() {
  try {
    console.log('Starting migration...');

    // Add new columns to tasks table
    await sequelize.query(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS taskType VARCHAR(20) DEFAULT 'list',
      ADD COLUMN IF NOT EXISTS imageUrl VARCHAR(255) DEFAULT NULL
    `);
    console.log('Successfully added taskType and imageUrl columns to tasks table');

    // Create reminders table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        taskId BIGINT NOT NULL,
        remindedUserId INT NOT NULL,
        remindedByUserId INT NOT NULL,
        message TEXT,
        isRead BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (remindedUserId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (remindedByUserId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Reminders table created successfully');

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();*/