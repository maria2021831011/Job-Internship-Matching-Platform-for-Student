const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '1234', 
  database: 'careerlaunch',
  connectTimeout: 60000,
  reconnect: true
});

connection.connect((err) => {
  if (err) {
    console.error(` Error connecting to MySQL:`, err.message);
    console.log(' Please check:');
    console.log('   1. Is MySQL server running?');
    console.log('   2. Is the database "careerlaunch" created?');
    console.log('   3. Are the username and password correct?');
    return;
  }
  console.log(' Connected to MySQL database');
 
  const createStudentsTable = `
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      institution VARCHAR(150) NOT NULL,
      department VARCHAR(150) NOT NULL,
      skills TEXT,
      availability VARCHAR(50),
      resume VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  const createCompaniesTable = `
    CREATE TABLE IF NOT EXISTS companies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      companyName VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      industry VARCHAR(100) NOT NULL,
      website VARCHAR(255),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  connection.query(createStudentsTable, (err) => {
    if (err) {
      console.error('Error creating students table:', err);
    } else {
      console.log('Students table ready');
    }
  });
  
  connection.query(createCompaniesTable, (err) => {
    if (err) {
      console.error('Error creating companies table:', err);
    } else {
      console.log('Companies table ready');
    }
  });
});

connection.on('error', (err) => {
  console.error('MySQL connection error:', err);
});

module.exports = connection;