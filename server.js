const app = require('./app');
const sequelize = require('./src/config/database');
const mysql = require('mysql2/promise');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Create database if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    
    const dbName = process.env.DB_NAME || 'github_analyzer';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database "${dbName}" verified/created successfully.`);
    await connection.end();

    // 2. Authenticate with the database
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // 3. Run Sequelize Migrations
    console.log('Running database migrations...');
    const { stdout, stderr } = await execPromise('npx sequelize-cli db:migrate');
    console.log(stdout);
    if (stderr) console.error(stderr);
    console.log('Migrations completed.');

    // 4. Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start the server:', error);
    process.exit(1);
  }
};

startServer();
