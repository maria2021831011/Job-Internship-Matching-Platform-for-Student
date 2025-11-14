/*require('dotenv').config();
const mysql = require('mysql2/promise'); 
const fs = require('fs');
const path = require('path');

async function connectDB() {
  try {
  
    const connection = await mysql.createConnection({
      host: "mysql-898f6ef-abcds.f.aivencloud.com",
      port: 28298,
      user: "avnadmin",
      password: "***REMOVED***",
      database: "defaultdb",
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.join(__dirname, './certs/ca.pem')), 
      },
      connectTimeout: 10000,
    });

    console.log('✅ Connected to Aiven MySQL successfully!');

  

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

    const dropApplicationsTable = `DROP TABLE IF EXISTS applications`;

    const createApplicationsTable = `
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        student_id INT NOT NULL,
        status ENUM('applied', 'shortlisted', 'interview', 'hired', 'rejected') DEFAULT 'applied',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        cover_letter TEXT,
        resume_path VARCHAR(500),
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY unique_application (job_id, student_id)
      )
    `;

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

   

    await connection.execute(createStudentsTable);
    console.log('✅ Students table ready');

    await connection.execute(createCompaniesTable);
    console.log('✅ Companies table ready');

    await connection.execute(createJobsTable);
    console.log('✅ Jobs table ready');

    await connection.execute(dropApplicationsTable);
    console.log('✅ Applications table dropped (if existed)');

    await connection.execute(createApplicationsTable);
    console.log('✅ Applications table created');

    await connection.execute(createMessagesTable);
    console.log('✅ Messages table ready');

    await connection.execute(createNotificationsTable);
    console.log('✅ Notifications table ready');

    await connection.execute(createStudentProfilesTable);
    console.log('✅ Student profiles table ready');

    await connection.execute(createCompanyProfilesTable);
    console.log('✅ Company profiles table ready');

    return connection; 
  } catch (err) {
    console.error('❌ Error connecting or initializing DB:', err);
    process.exit(1);
  }
}

module.exports = connectDB;*/
