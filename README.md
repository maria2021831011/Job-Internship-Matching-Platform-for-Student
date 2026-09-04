# CareerLaunch Internship Portal

CareerLaunch is a full-stack internship and job-matching platform for students and companies. It allows students to register, upload resumes, explore internship opportunities, apply for jobs, and manage their profile, while companies can post jobs, review applicants, and update application statuses.

## Overview

This project is built as a Node.js + Express application with a static front-end (HTML/CSS/JavaScript) and a MySQL database for persistent data storage. The app is designed around a simple portal flow:

- Student registration and login
- Company registration and login
- Job listings and job application workflow
- Company-side job management and applicant review
- Student and company profile management
- Messaging and notification APIs
- File uploads for resumes and profile pictures

## Tech Stack

- Backend: Node.js, Express
- Database: MySQL
- Authentication: Express Session + bcryptjs
- File uploads: Multer
- Frontend: Plain HTML, CSS, JavaScript
- Development tools: Nodemon

## Project Structure

```text
.
├── api/
│   ├── auth/
│   │   ├── login.js
│   │   ├── password.js
│   │   └── register.js
│   ├── jobs/
│   │   └── jobs.js
│   ├── messages/
│   │   ├── jobs.js
│   │   └── messages.js
│   ├── notifications/
│   │   ├── jobs.js
│   │   ├── messages.js
│   │   └── notifications.js
│   ├── profile/
│   │   └── profile.js
│   └── student/
│       └── profile.js
├── certs/
│   └── ca.pem
├── config/
│   └── database.js
├── css/
│   └── ...
├── database/
├── js/
│   ├── components/
│   ├── pages/
│   └── config.js
├── public/
│   └── css/
├── uploads/
│   ├── profiles/
│   └── resumes/
├── com.html
├── forgot-password.html
├── index.html
├── index.js
├── login.html
├── package.json
├── password.js
├── pic.avif
├── post-job.html
├── profile.html
├── registration.html
├── reset-password.html
├── server.js
├── stu.html
├── student/
├── student-jobs.html
└── README.md
```

## Features

### Student Features
- Student registration with institution and department details
- Resume upload during signup
- Login using email and password
- Job browsing and application submission
- Application status tracking
- Profile update with bio, skills, location, and photo
- Messaging and notifications support

### Company Features
- Company registration with industry and website information
- Login and session handling
- Job posting with title, description, requirements, and deadline
- Review of candidate applications
- Application status updates such as shortlisted, interview, hired, or rejected
- Job listing management

### Core Platform Features
- Session-based authentication
- Static landing page and registration flow
- MySQL table initialization on startup
- Upload directories for resumes and profile images
- Health check endpoint for app validation

## Database Model

The app initializes the following tables in MySQL:

- students
- companies
- jobs
- applications
- messages
- notifications
- student_profiles
- company_profiles

This logic is handled in [config/database.js](config/database.js).

## Setup and Installation

1. Clone the project and open the folder.
2. Install dependencies:

```bash
npm install
```

3. Make sure MySQL is available and the database connection settings are correct in [config/database.js](config/database.js).

4. Start the server:

```bash
npm start
```

Or use nodemon during development:

```bash
npm run dev
```

5. Open the app in the browser:

```text
http://localhost:3000
```

## Running the App

The app starts from [server.js](server.js), which:

- sets up Express
- creates required upload folders
- configures the session middleware
- serves the static front-end pages
- mounts the API routes
- initializes the database and starts the server on port 3000

## Main API Routes

The project exposes REST-style routes under `/api`:

- `POST /api/auth/register_student`
- `POST /api/auth/register_company`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/status`
- `GET /api/jobs/active`
- `POST /api/jobs/apply`
- `GET /api/jobs/company`
- `GET /api/jobs/applications`
- `PUT /api/jobs/applications/:id/status`
- `POST /api/jobs/create`
- `GET /api/profile/profile`
- `PUT /api/profile/profile`
- `GET /api/health`

## Notes

- The current project uses a MySQL connection configured directly in [config/database.js](config/database.js).
- The application is a student/company portal with static pages and server-managed APIs, rather than a modern framework-based app.
- The database and upload directories are created automatically when the server starts.

## Possible Improvements

- Move database credentials to environment variables using `.env`
- Add input validation and stronger error handling
- Improve security for sessions and cookies
- Add proper frontend routing and modular client-side architecture
- Add automated tests for auth and job APIs
- Refactor the project into a more maintainable MVC-style structure

## License

This project currently declares the ISC license in [package.json](package.json).
