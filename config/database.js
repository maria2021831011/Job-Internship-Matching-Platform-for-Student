const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '1234', // CHANGE THIS!
  database: 'careerlaunch',
  connectTimeout: 60000,
  reconnect: true
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
    console.log('💡 Please check:');
    console.log('   1. Is MySQL server running?');
    console.log('   2. Is the database "careerlaunch" created?');
    console.log('   3. Are the username and password correct?');
    return;
  }
  console.log('✅ Connected to MySQL database');
  
  // Create tables if they don't exist
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
      console.log('✅ Students table ready');
    }
  });
  
  connection.query(createCompaniesTable, (err) => {
    if (err) {
      console.error('Error creating companies table:', err);
    } else {
      console.log('✅ Companies table ready');
    }
  });
});

// Add this after creating the companies table
const createJobsTable = `
  CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    job_type VARCHAR(50) NOT NULL,
    salary_range VARCHAR(100),
    application_deadline DATE,
    skills_required TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'closed', 'draft') DEFAULT 'active',
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
  )
`;

const createApplicationsTable = `
  CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('applied', 'shortlisted', 'interview', 'hired', 'rejected') DEFAULT 'applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cover_letter TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, student_id)
  )
`;

connection.query(createJobsTable, (err) => {
  if (err) {
    console.error('Error creating jobs table:', err);
  } else {
    console.log('✅ Jobs table ready');
  }
});

connection.query(createApplicationsTable, (err) => {
  if (err) {
    console.error('Error creating applications table:', err);
  } else {
    console.log('✅ Applications table ready');
  }
});
// Handle connection errors
connection.on('error', (err) => {
  console.error('MySQL connection error:', err);
});

module.exports = connection;