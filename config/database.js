

const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '1234',
  database: 'careerlaunch',
  connectTimeout: 60000
  
});



// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error(' Error connecting to MySQL:', err.message);
    console.log('Please check:');
    console.log('   1. Is MySQL server running?');
    console.log('   2. Is the database "careerlaunch" created?');
    console.log('   3. Are the username and password correct?');
    
    const tempConnection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234'
    });
    
    tempConnection.connect((tempErr) => {
      if (tempErr) {
        console.error('Cannot connect to MySQL server at all');
        return;
      }
      
      tempConnection.query('CREATE DATABASE IF NOT EXISTS careerlaunch', (createErr) => {
        if (createErr) {
          console.error(' Error creating database:', createErr.message);
        } else {
          console.log('Database "careerlaunch" created or already exists');
        }
        tempConnection.end();
      });
    });
    
    return;
  }
  console.log(' Connected to MySQL database');
  
  createTablesInOrder();
});

function createTablesInOrder() {
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
      console.error(' Error creating students table:', err);
    } else {
      console.log(' Students table ready');
    }
  });
  
  connection.query(createCompaniesTable, (err) => {
    if (err) {
      console.error(' Error creating companies table:', err);
    } else {
      console.log(' Companies table ready');
      createJobsTable();
    }
  });
}

function createJobsTable() {
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

  connection.query(createJobsTable, (err) => {
    if (err) {
      console.error(' Error creating jobs table:', err);
    } else {
      console.log(' Jobs table ready');
      createApplicationsTable();
    }
  });
}

function createApplicationsTable() {
  const createApplicationsTableQuery = `
    CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      job_id INT NOT NULL,
      student_id INT NOT NULL,
      status ENUM('applied', 'shortlisted', 'interview', 'hired', 'rejected') DEFAULT 'applied',
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      cover_letter TEXT,
      resume_path VARCHAR(500),
      interview_date DATETIME NULL,
      interview_notes TEXT,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      UNIQUE KEY unique_application (job_id, student_id)
    )
  `;

  connection.query(createApplicationsTableQuery, (err) => {
    if (err) {
      console.error('Error creating applications table:', err);
    } else {
      console.log(' Applications table ready');
      createInterviewsTable();
    }
  });
}


function createInterviewsTable() {
    const createInterviewsTable = `
        CREATE TABLE IF NOT EXISTS interviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            student_email VARCHAR(255) NOT NULL,
            interview_date DATETIME NOT NULL,
            meeting_platform VARCHAR(50) NOT NULL,
            status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )
    `;

    connection.query(createInterviewsTable, (err) => {
        if (err) {
            console.error(' Error creating interviews table:', err);
        } else {
            console.log('Interviews table ready');
            createOtherTables()
        }
    });
}

function createOtherTables() {
  const createMessagesTable = `
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sender_id INT NOT NULL,
      receiver_id INT NOT NULL,
      sender_type ENUM('student', 'company') NOT NULL,
      receiver_type ENUM('student', 'company') NOT NULL,
      message TEXT NOT NULL,
      read_status BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_sender (sender_id, sender_type),
      INDEX idx_receiver (receiver_id, receiver_type)
    )
  `;

  const createNotificationsTable = `
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      user_type ENUM('student', 'company') NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type ENUM('application', 'interview', 'message', 'system') DEFAULT 'system',
      read_status BOOLEAN DEFAULT FALSE,
      related_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id, user_type)
    )
  `;

  const createStudentProfilesTable = `
    CREATE TABLE IF NOT EXISTS student_profiles (
      student_id INT PRIMARY KEY,
      phone VARCHAR(20),
      graduation_date DATE,
      location VARCHAR(100),
      bio TEXT,
      skills TEXT,
      resume_path VARCHAR(500),
      profile_picture VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )
  `;

  const createCompanyProfilesTable = `
    CREATE TABLE IF NOT EXISTS company_profiles (
      company_id INT PRIMARY KEY,
      phone VARCHAR(20),
      website VARCHAR(255),
      description TEXT,
      logo_path VARCHAR(500),
      size VARCHAR(50),
      founded_year INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `;

  const tables = [
    { query: createMessagesTable, name: 'messages' },
    { query: createNotificationsTable, name: 'notifications' },
    { query: createStudentProfilesTable, name: 'student_profiles' },
    { query: createCompanyProfilesTable, name: 'company_profiles' }
  ];

  tables.forEach(({ query, name }) => {
    connection.query(query, (err) => {
      if (err) {
        console.error(` Error creating ${name} table:`, err);
      } else {
        console.log(`${name} table ready`);
      }
    });
  });

  console.log(' All database tables are ready!');
}


connection.on('error', (err) => {
  console.error('MySQL connection error:', err);
});

module.exports = connection;

