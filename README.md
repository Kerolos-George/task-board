# Task Board - Team Task Management Application

A full-stack team task management application built with **NestJS**, **React**, **Prisma**, and **PostgreSQL**. This application enables teams to manage projects, assign tasks, track progress, and collaborate efficiently.

---

## Features

### Core Functionality

#### 1. User Management & Authentication
- **JWT-based authentication** with secure password hashing (bcryptjs)
- **Role-based access control**: Admin and Member roles
- User registration and login
- Protected routes and API endpoints

#### 2. Project Management
- **Create, view, update, and delete projects**
- **Role-based permissions**:
  - Admins can manage all projects
  - Members can only manage projects they're assigned to
- **Project member management**: Add/remove team members
- **Search and filter** projects by name
- **Pagination and sorting** for project lists

#### 3. Task Management
- **Full CRUD operations** for tasks within projects
- **Task properties**:
  - Title, description, priority (Low, Medium, High, Critical)
  - Status (Todo, In Progress, In Review, Done, Archived)
  - Due dates and assignee
- **Advanced filtering**:
  - Filter by status, priority, assignee
  - Search by title/description
  - Date range filtering
- **Drag-and-drop** task board interface
- **Real-time status updates** with audit trail

#### 4. Access Control
- **Project-level permissions**: Only project members can access project tasks
- **Task visibility**: Users can only view/edit tasks in their assigned projects
- **Role enforcement**: Admin privileges for system-wide operations

---

## Bonus Features Implemented ✨

1. **Pagination, Sorting & Search**
   - All list endpoints support pagination (`page`, `limit`)
   - Sort projects and tasks by multiple fields
   - Full-text search on projects and tasks

2. **Task Status History (Audit Log)**
   - Automatic tracking of all task status changes
   - Records who changed the status and when
   - View complete history of task progression

3. **API Documentation (Swagger)**
   - Interactive API documentation at `/docs`
   - Try API endpoints directly from the browser
   - Complete request/response schemas
   - JWT authentication support in Swagger UI

---

## Tech Stack

### Backend
- **Framework**: NestJS (Node.js/TypeScript)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: JWT with Passport
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Fetch API with custom client
- **Styling**: Custom CSS with modern design

---

## Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **PostgreSQL** database
- **Git**

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/taskboard?schema=public&pgbouncer=true"
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   JWT_EXPIRES_IN="7d"
   FRONTEND_URL="http://localhost:5173"
   ```

4. **Set up database**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # Seed initial data (Admin & Member users + demo project)
   npm run prisma:seed
   ```

5. **Start the backend**
   ```bash
   # Development mode with hot-reload
   npm run start:dev
   
   # Or production mode
   npm run build
   npm run start:prod
   ```

   Backend will run at http://localhost:3000
   Swagger : http://localhost:3000/docs

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Start the frontend**
   ```bash
   npm run dev
   ```

   Frontend will run at http://localhost:5173

---

## Default Credentials

After running `npm run prisma:seed`, you can log in with:

### Admin User
- **Email**: `admin@taskboard.com`
- **Password**: `Admin123!`
- **Role**: Admin (full access)

### Member User
- **Email**: `member@taskboard.com`
- **Password**: `Member123!`
- **Role**: Member (project-based access)

---

## API Documentation

Once the backend is running, access the interactive API documentation at:

**http://localhost:3000/docs**

The Swagger UI allows you to:
- Browse all available endpoints
- View request/response schemas
- Test API endpoints directly
- Authenticate with JWT tokens

### Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login and get JWT token |
| `/api/projects` | GET | List all projects (with pagination) |
| `/api/projects` | POST | Create new project |
| `/api/projects/:id` | GET | Get project details |
| `/api/projects/:id` | PATCH | Update project |
| `/api/projects/:id` | DELETE | Delete project |
| `/api/projects/:id/members` | POST | Add member to project |
| `/api/projects/:id/members/:userId` | DELETE | Remove member |
| `/api/tasks` | GET | List tasks (with filters) |
| `/api/tasks` | POST | Create new task |
| `/api/tasks/:id` | GET | Get task details |
| `/api/tasks/:id` | PATCH | Update task |
| `/api/tasks/:id` | DELETE | Delete task |
| `/api/tasks/:id/history` | GET | Get task status history |

---

## Database Schema

The application uses the following main entities:

- **User**: Authentication and profile information
- **Project**: Project details and ownership
- **ProjectMember**: Many-to-many relationship between users and projects
- **Task**: Task details with status, priority, and assignments
- **TaskStatusHistory**: Audit log for task status changes

See `docs/db-design.md` for detailed schema documentation.

---

## Development

### Useful Commands

#### Backend
```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Run tests
npm run test

# Build for production
npm run build
```

#### Frontend
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Project Structure

```
task-board/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── migrations/         # Database migrations
│   │   └── seed.ts            # Seed data
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # User management
│   │   ├── projects/          # Project management
│   │   ├── tasks/             # Task management
│   │   ├── common/            # Shared utilities (guards, decorators, filters)
│   │   └── main.ts            # Application entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Route pages
│   │   ├── api.ts             # API client
│   │   ├── auth.tsx           # Auth context
│   │   └── App.tsx            # Main app component
│   └── package.json
├── docs/
│   └── db-design.md           # Database design documentation
└── README.md                   # This file
```

---

## Testing

### Test Credentials
Use the seeded accounts (see "Default Credentials" above) for testing.

### Testing Workflow

1. **Login** as Admin or Member
2. **Create a project** (Admin can create any, Member needs to be added)
3. **Add team members** to the project
4. **Create tasks** with different priorities and statuses
5. **Update task status** and check the audit log
6. **Filter and search** tasks
7. **Test access control** by logging in as different users

---

## Architecture Highlights

### Backend
- **Modular architecture** with feature-based modules
- **Global exception filter** for consistent error handling
- **Request logging interceptor** for observability
- **JWT authentication** with passport strategy
- **Role-based guards** for authorization
- **DTO validation** with class-validator
- **Swagger decorators** for API documentation

### Frontend
- **Component-based architecture** with reusable UI components
- **Context API** for global authentication state
- **Protected routes** with authentication guards
- **Centralized API client** with token management
- **Form validation** with user feedback
- **Responsive design** for mobile and desktop

---

## Security Features

- JWT tokens with configurable expiration
- Password hashing with bcryptjs (10 salt rounds)
- Role-based access control (RBAC)
- Project-level permissions
- Input validation and sanitization
- CORS configuration
- Environment variable protection





---

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

## Acknowledgments

- Built as a demonstration of full-stack development skills
- Implements modern best practices for web applications
- Designed with scalability and maintainability in mind
