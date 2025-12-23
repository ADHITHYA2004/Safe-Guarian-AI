# Guardian Vision Assist

A harassment detection system with emergency alert capabilities.

## Features

- Real-time camera feed monitoring
- AI-powered harassment detection
- Emergency contact management
- Alert history and analytics
- User settings and quiet hours configuration

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MySQL Server (v5.7 or higher, or MariaDB 10.2+)

### Installation

1. **Install frontend dependencies:**

   ```bash
   npm install
   ```

2. **Install backend dependencies:**

   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Setup MySQL Database:**

   - Install MySQL if not already installed
   - Start MySQL service
   - Create a `.env` file in the `server` directory:

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=guardian_vision
   PORT=3001
   JWT_SECRET=your-secret-key-change-in-production
   ```

4. **Create environment file for frontend (optional):**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

### Running the Application

1. **Start the backend server:**

   ```bash
   cd server
   npm start
   ```

   The server will run on `http://localhost:3001` and automatically create the MySQL database and tables.

2. **Start the frontend (in a new terminal):**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:8080`

### Database

The application uses **MySQL** for data storage. The database and tables are automatically created when the server starts for the first time.

**Prerequisites:**

- MySQL Server installed and running
- MySQL user with CREATE DATABASE privileges

**Configuration:**
Create a `.env` file in the `server` directory with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=guardian_vision
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
```

**Automatic Table Creation:**

- Database is automatically created if it doesn't exist
- Tables are automatically created when the server starts
- No manual migration needed

### Running on Different Machines

The application is designed to work on any machine:

1. Clone or copy the project to the new machine
2. Install dependencies (frontend and backend)
3. Start the server - it will automatically create the database and tables
4. Start the frontend
5. Create a new account or use existing credentials

**Note:** The database runs on MySQL server. Make sure MySQL is running before starting the server. For production, use a proper MySQL server setup with backups.

## Project Structure

```
.
├── server/              # Backend API server
│   ├── db/             # Database initialization
│   │   └── init.js     # Auto-creates tables on startup
│   ├── index.js        # Express server and API routes
│   └── package.json    # Server dependencies
├── src/                # Frontend React application
│   ├── components/     # React components
│   ├── lib/           # Utilities and API client
│   ├── pages/         # Page components
│   └── ...
└── server/.env        # MySQL configuration (create this file)
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in
- `GET /api/auth/me` - Get current user

### Emergency Contacts

- `GET /api/emergency-contacts` - Get all contacts
- `POST /api/emergency-contacts` - Create contact
- `PUT /api/emergency-contacts/:id` - Update contact
- `DELETE /api/emergency-contacts/:id` - Delete contact

### Alerts

- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create alert

### Settings

- `GET /api/user-settings` - Get user settings
- `PUT /api/user-settings` - Update settings

### Emergency

- `POST /api/emergency-alert` - Send emergency alert

## Development

The backend server uses:

- Express.js for the API
- MySQL (mysql2) for the database
- JWT for authentication
- bcryptjs for password hashing

The frontend uses:

- React with TypeScript
- Vite for building
- React Router for navigation
- Shadcn UI components

## Notes

- The MySQL database is automatically created when the server starts
- All tables are created automatically - no migrations needed
- Make sure MySQL server is running before starting the application
- JWT tokens are stored in localStorage on the frontend
- For production, use environment variables for database credentials
