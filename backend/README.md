# PCSHS School Management System - Backend

Complete Node.js/Express backend for the PCSHS School Management System.

## Setup Instructions

### 1. Install Node.js
- Download from: https://nodejs.org/ (LTS version recommended)
- Install and restart VS Code

### 2. Install PostgreSQL
- Download from: https://www.postgresql.org/download/
- During installation:
  - Set password for `postgres` user (remember this!)
  - Keep port as 5432 (default)

### 3. Create Database
Open PostgreSQL (pgAdmin or command line):
```sql
CREATE DATABASE pcshs_sms;
```

### 4. Install Backend Dependencies
```bash
cd backend
npm install
```

### 5. Configure Environment Variables
Edit `.env` file:
```
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pcshs_sms
JWT_SECRET=generate_a_random_string_here
```

### 6. Run Backend
```bash
npm start
```

Server will run on: `http://localhost:5000`

---

## API Endpoints

### Authentication
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user
- **GET** `/api/auth/me` - Get current user (requires token)

### Users (Admin only)
- **GET** `/api/users/all` - Get all users
- **GET** `/api/users/pending` - Get pending approvals
- **PUT** `/api/users/approve/:userId` - Approve user
- **PUT** `/api/users/role/:userId` - Change user role
- **DELETE** `/api/users/:userId` - Delete user

### Announcements
- **GET** `/api/announcements` - Get all announcements (public)
- **GET** `/api/announcements/:id` - Get single announcement
- **POST** `/api/announcements` - Create (admin/staff)
- **PUT** `/api/announcements/:id` - Edit (admin/staff)
- **DELETE** `/api/announcements/:id` - Delete (admin)

### Attendance
- **GET** `/api/attendance` - Get attendance records (public view)
- **GET** `/api/attendance/report?date=YYYY-MM-DD` - Daily report
- **POST** `/api/attendance` - Record attendance (admin/staff)
- **DELETE** `/api/attendance/:id` - Delete record (admin)

### Lost & Found
- **GET** `/api/lost-found` - Get all items (public)
- **GET** `/api/lost-found/:id` - Get item details
- **POST** `/api/lost-found` - Post item (authenticated)
- **PUT** `/api/lost-found/:id` - Update item (owner/admin)
- **DELETE** `/api/lost-found/:id` - Delete item (owner/admin)

### Staff
- **GET** `/api/staff` - Get staff directory (public)
- **GET** `/api/staff/:id` - Get staff member details
- **POST** `/api/staff` - Add staff (admin)
- **PUT** `/api/staff/:id` - Update staff (admin)
- **DELETE** `/api/staff/:id` - Delete staff (admin)

---

## User Roles

1. **Viewer** (Default)
   - Can view announcements, attendance, lost & found
   - Can post items in lost & found
   - Needs admin approval to log in

2. **Staff**
   - Can do everything viewers can
   - Can record attendance
   - Can create/edit announcements
   - Can manage lost & found items

3. **Admin**
   - Full access to all features
   - Can manage users and roles
   - Can delete any content

---

## First Time Setup

1. After backend is running, create an admin account:
   - Register via `/api/auth/register`
   - Then manually update the database:
   ```sql
   UPDATE users SET role = 'admin', is_allowed = true WHERE email = 'your@email.com';
   ```

2. Or use SQL to create admin directly:
   ```sql
   INSERT INTO users (email, password, full_name, role, is_allowed) 
   VALUES ('admin@pcshs.edu', 'hashed_password', 'Admin', 'admin', true);
   ```

---

## Frontend Integration

Update your frontend's API base URL:
```javascript
const API_URL = 'http://localhost:5000/api';
```

---

## Troubleshooting

**Port 5000 already in use:**
```bash
# Change PORT in .env file
PORT=5001
```

**Database connection error:**
- Check PostgreSQL is running
- Verify credentials in .env
- Check database name exists

**CORS errors:**
- Update CORS_ORIGIN in .env to match your frontend URL

---

Need help? Check the individual controller files for detailed comment documentation.
