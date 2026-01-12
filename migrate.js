const fs = require('fs').promises;
const path = require('path');
const { sequelize, User, Task, Share } = require('./models');

async function migrate() {
  try {
    console.log('Starting migration from JSON to MySQL...\n');

    // Step 1: Test database connection
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Database connection established\n');

    // Step 2: Create tables (drop existing ones)
    console.log('Creating database tables...');
    await sequelize.sync({ force: true }); 
    console.log('Tables created successfully\n');

    // Step 3: Read JSON files
    console.log('Reading JSON files...');
    const usersData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'users.json'), 'utf-8')
    );
    const tasksData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'tasks.json'), 'utf-8')
    );
    const sharesData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'shares.json'), 'utf-8')
    );
    console.log(`Found ${usersData.length} users, ${tasksData.length} tasks, ${sharesData.length} shares\n`);

    // Step 4: Migrate Users
    console.log('Migrating users...');
    for (const user of usersData) {
      await User.create({
        id: user.id,
        username: user.username,
        email: user.email || null,
        password: user.password,
        createdAt: new Date(user.createdAt)
      });
    }
    console.log(`Migrated ${usersData.length} users\n`);

    // Step 5: Migrate Tasks
    console.log('Migrating tasks...');
    let migratedTasks = 0;
    let skippedTasks = 0;
    
    for (const task of tasksData) {
      try {
        // Map completedBy username to completedById
        let completedById = null;
        if (task.completedBy) {
          const completedByUser = usersData.find(u => u.username === task.completedBy);
          if (completedByUser) {
            completedById = completedByUser.id;
          }
        }

        await Task.create({
          id: task.id,
          userId: task.userId,
          task: task.task,
          category: task.category,
          createdAt: new Date(task.createdAt),
          completed: task.completed,
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
          completedById: completedById
        });
        migratedTasks++;
      } catch (error) {
        console.log(` Skipped task ${task.id}: ${error.message}`);
        skippedTasks++;
      }
    }
    console.log(` Migrated ${migratedTasks} tasks (${skippedTasks} skipped)\n`);

    // Step 6: Migrate Shares
    console.log(' Migrating shares...');
    for (const share of sharesData) {
      await Share.create({
        id: share.id,
        category: share.category,
        ownerId: share.ownerId,
        sharedWithUserId: share.sharedWithUserId,
        createdAt: new Date(share.createdAt)
      });
    }
    console.log(` Migrated ${sharesData.length} shares\n`);

    // Step 7: Verify migration
    console.log('Verifying migration...');
    const userCount = await User.count();
    const taskCount = await Task.count();
    const shareCount = await Share.count();
    
    console.log(`\n Migration Summary:`);
    console.log(`   Users:  ${userCount}/${usersData.length}`);
    console.log(`   Tasks:  ${taskCount}/${tasksData.length}`);
    console.log(`   Shares: ${shareCount}/${sharesData.length}`);

    if (userCount === usersData.length && 
        taskCount === migratedTasks && 
        shareCount === sharesData.length) {
      console.log('\nMigration completed successfully!');
    } else {
      console.log('\nWueh, migration completed with discrepancies. Review.');
    }

    // Step 8: Create backup of JSON files
    console.log('\nCreating backup of JSON files...');
    const backupDir = path.join(__dirname, 'json_backup');
    await fs.mkdir(backupDir, { recursive: true });
    await fs.copyFile('users.json', path.join(backupDir, `users_${Date.now()}.json`));
    await fs.copyFile('tasks.json', path.join(backupDir, `tasks_${Date.now()}.json`));
    await fs.copyFile('shares.json', path.join(backupDir, `shares_${Date.now()}.json`));
    console.log('Backup created in json_backup/\n');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration
migrate();