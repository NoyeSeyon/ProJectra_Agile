# 🚀 Projectra - Agile Project Management Platform

A comprehensive, multi-tenant SaaS platform for agile project management with real-time collaboration, built with the MERN stack (MongoDB, Express.js, React, Node.js).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Module Breakdown](#module-breakdown)
- [Installation Guide](#installation-guide)
- [Environment Configuration](#environment-configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Validations & Innovations](#validations--innovations)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

**Projectra** is an enterprise-grade project management platform designed to streamline agile workflows across organizations. It features a sophisticated **multi-tenant architecture** where Super Admins manage organizations, Admins manage users, Project Managers orchestrate projects, and team members collaborate on tasks in real-time.

### 🌟 Standout Features

- **Multi-Tenant SaaS Architecture**: Complete organization isolation with subscription management
- **7-Level Role-Based Access Control**: super_admin, admin, project_manager, team_leader, member, client, guest
- **Real-Time Socket.IO Integration**: Live updates across all connected users
- **Intelligent Capacity Management**: Prevents team member overallocation (max 5 projects/member)
- **Task Dependency System**: Automatic blocking status calculation based on dependencies
- **Project Weighting Algorithm**: 1-10 scale with automatic complexity determination
- **20+ Specialization Types**: Skills-based task assignment and filtering

---

## 🔑 Key Features

### 1️⃣ Super Admin Management (App Management)
- **System-Wide Analytics Dashboard** with MongoDB aggregation
- **Organization Management** (create, update, delete with safety checks)
- **Admin Assignment** with email verification
- **Growth Tracking** (6-month organization trends)
- **Subscription Plans** (Free, Pro, Enterprise)

### 2️⃣ Admin User Management
- **User Role Management** (assign PM, team leader, member roles)
- **Capacity Management** (track PM capacity: 1-20 projects)
- **User Analytics** (breakdown by role, activity tracking)
- **Bulk User Operations** (invite, activate, deactivate)
- **PM Assignment Validation** (prevents over-capacity assignments)

### 3️⃣ Project Management
- **Project Creation** with weight-based complexity (light/medium/heavy)
- **Team Management** (add members, assign team leader)
- **Budget Tracking** (planned vs spent with alert thresholds)
- **Sprint Planning** with date validation
- **Member Capacity Visualization** (workload percentages)
- **Real-Time Project Updates** via Socket.IO

### 4️⃣ Member Management
- **20 Specialization Types** (UI/UX Designer, Software Engineer, QA Engineer, etc.)
- **Capacity Tracking** (max 5 projects, max 1 team leader role)
- **Skills & Levels** (beginner, intermediate, advanced, expert)
- **Member Dashboard** with assigned projects and tasks
- **Workload Visualization** (capacity percentage)

### 5️⃣ Task Management
- **Task Dependencies** (blocks/blocked_by relationships)
- **Fibonacci Story Points** (1, 2, 3, 5, 8, 13, 21, 34, 55, 89)
- **Subtask Hierarchy** (break down complex tasks)
- **Time Tracking** (estimated vs logged hours)
- **Due Date Validation** (prevents past dates)
- **Specialization Matching** (assign based on required skills)
- **Kanban Board** with drag-and-drop
- **Blocking Status** (not_blocked, waiting, blocked)

---

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │  MongoDB Atlas  │
│                 │◄──►│                 │◄──►│                 │
│  - Components   │    │  - REST APIs    │    │  - Collections  │
│  - State Mgmt   │    │  - Socket.io    │    │  - Indexes      │
│  - Routing      │    │  - Middleware   │    │  - Aggregation  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture

```
client/src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── pm/             # Project Manager components
│   ├── common/         # Shared components
│   └── forms/          # Form components
├── pages/              # Route pages
│   ├── superAdmin/     # Super Admin dashboards
│   ├── admin/          # Admin pages
│   ├── pm/             # PM pages
│   ├── member/         # Member pages
│   └── auth/           # Authentication pages
├── contexts/           # React Context providers
├── services/           # API service modules
└── utils/              # Utility functions

server/
├── controllers/        # Route handlers (business logic)
├── models/            # Mongoose schemas
├── routes/            # API route definitions
├── middleware/        # Custom middleware (auth, validation)
├── services/          # External services (email, AI)
└── socket/            # Socket.IO event handlers
```

---

## 💻 Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **ApexCharts** - Interactive charts and analytics
- **@dnd-kit** - Drag and drop for Kanban
- **Socket.io-client** - Real-time communication
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time bidirectional events
- **JWT** - Stateless authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email sending
- **Express-validator** - Input validation

### Database Schema
- **10+ Collections**: Users, Organizations, Projects, Tasks, Sprints, Teams, etc.
- **Indexed Fields**: organization, role, status, assignee, project
- **Aggregation Pipelines**: Complex analytics queries
- **Referential Integrity**: Mongoose population

---

## 📦 Module Breakdown

### Module 1: Super Admin (App Management)
**Files**: 
- `server/controllers/superAdminController.js` (603 lines)
- `client/src/pages/superAdmin/` (4 pages)

**Key Functions**:
- `getSystemAnalytics()` - MongoDB aggregation for growth trends
- `createOrganization()` - Organization creation with validation
- `createAdmin()` - Admin assignment with email checks
- `deleteOrganization()` - Safe deletion with user count validation

**Validations**:
- ✅ Organization slug uniqueness
- ✅ Cannot delete org with active users
- ✅ Admin email uniqueness
- ✅ Required fields validation

### Module 2: Admin (User Management)
**Files**:
- `server/controllers/adminController.js` (662 lines)
- `client/src/pages/admin/` (3 pages)

**Key Functions**:
- `assignPM()` - Assign user as Project Manager (Lines 45-120)
- `unassignPM()` - Remove PM role with active project checks (Lines 123-202)
- `changeUserRole()` - Role management with validation (Lines 375-458)
- `updatePMCapacity()` - Dynamic capacity management (Lines 250-334)

**Validations**:
- ✅ PM capacity limits (1-20 projects)
- ✅ Active projects check before PM removal
- ✅ Cannot change super_admin role
- ✅ Same organization verification
- ✅ Email uniqueness on invitation

### Module 3: Project Management
**Files**:
- `server/controllers/pmController.js` (2164 lines - comprehensive!)
- `server/models/Project.js` (297 lines)
- `client/src/pages/pm/` (7 pages)

**Key Functions**:
- `createProject()` - Project creation with weighting (Lines 578-678)
- `addMemberToProject()` - Add member with capacity check (Lines 976-1099)
- `updateTeamLeader()` - TL assignment with 1-role limit (Lines 1203-1355)
- `removeMemberFromProject()` - Safe removal with task reassignment (Lines 1102-1200)

**Validations**:
- ✅ Project name required
- ✅ Member capacity (max 5 projects)
- ✅ Team leader capacity (max 1 TL role)
- ✅ Member not already in project
- ✅ Date range validation

**Innovative Features**:
- Project weighting system (1-10 → light/medium/heavy)
- Real-time Socket.IO events for all project changes
- Budget tracking with alert thresholds
- Automatic task reassignment on member removal

### Module 4: Member Management
**Files**:
- `server/models/User.js` (227 lines)
- `client/src/pages/member/` (5 pages)

**Key Features**:
- 20 specialization types (UI/UX Designer, Software Engineer, etc.)
- Capacity tracking system (Lines 85-108)
- Skills array with proficiency levels (Lines 77-84)
- Workload percentage calculation

**Validations**:
- ✅ Specialization enum enforcement
- ✅ Capacity limits (5 projects, 1 TL role)
- ✅ Role validation (member/team_leader only)
- ✅ Organization membership required

### Module 5: Task Management
**Files**:
- `server/controllers/pmController.js` (Task methods, Lines 1547-2163)
- `server/controllers/taskController.js` (490 lines)
- `server/models/Task.js` (306 lines)
- `client/src/components/pm/TaskManagementModal.js`

**Key Functions**:
- `createTask()` - Task creation with dependency validation (Lines 1547-1692)
- `updateTask()` - Update with blocking status recalculation (Lines 1699-1798)
- `deleteTask()` - Cascade delete with relationship cleanup (Lines 1805-1900)
- `addTaskDependency()` - Add dependency with circular check (Lines 1970-2074)

**Validations**:
- ✅ Due date cannot be in past (3-layer validation)
- ✅ Specialization enum matching (snake_case)
- ✅ Assignee must be project member
- ✅ Dependencies must be same project
- ✅ Circular dependency prevention
- ✅ Self-dependency prevention

**Innovative Features**:
- Task dependency graph (dependencies + blockedBy arrays)
- Automatic blocking status calculation
- Fibonacci story points (Agile estimation)
- Subtask hierarchy with cascade operations
- Time tracking (estimated vs logged hours)

---

## 🚀 Installation Guide

### Prerequisites
- **Node.js** v16+ and npm
- **MongoDB Atlas** account (or local MongoDB)
- **Git** installed

### 1. Clone Repository

```bash
git clone https://github.com/NoyeSeyon/ProJectra_Agile.git
cd ProJectra_Agile
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

Create `server/config.env` from the template:

```bash
cd server
cp config.env.example config.env
```

Edit `server/config.env` with your credentials:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/projectra
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
PORT=5001
CLIENT_URL=http://localhost:3000
```

**⚠️ IMPORTANT**: Never commit `config.env` to version control!

### 4. Create Super Admin (Optional)

```bash
cd server
npm run create-superadmin
```

Follow the prompts to create the first super admin account.

### 5. Start Development Servers

**Option A: Start Both Servers Simultaneously (Windows)**
```bash
# From project root
START_SERVERS.bat
```

**Option B: Start Separately**

Terminal 1 (Backend):
```bash
cd server
npm run dev
# Server runs on http://localhost:5001
```

Terminal 2 (Frontend):
```bash
cd client
npm start
# Client runs on http://localhost:3000
```

### 6. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api

---

## ⚙️ Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/projectra` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key_min_32_chars` |
| `JWT_EXPIRE` | JWT token expiration | `7d` |
| `PORT` | Server port | `5001` |
| `CLIENT_URL` | Frontend URL | `http://localhost:3000` |
| `EMAIL_USER` | SMTP email address | `your_email@gmail.com` |
| `EMAIL_PASS` | SMTP app password | `your_app_password` |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `SLACK_BOT_TOKEN` | Slack integration token |
| `ENABLE_KANBAN` | Enable Kanban board feature |
| `ENABLE_AI_ASSISTANT` | Enable AI assistant |

See `server/config.env.example` for complete list.

---

## 📖 Usage

### Super Admin Workflow
1. Login with super admin credentials
2. Create organizations (e.g., "Acme Corp")
3. Assign admins to each organization
4. Monitor system-wide analytics

### Admin Workflow
1. Login as admin
2. Invite users to organization
3. Assign Project Manager roles
4. Manage user capacity and roles

### Project Manager Workflow
1. Create new project with weight (1-10)
2. Add team members (checks capacity)
3. Assign team leader (max 1 TL role)
4. Create main tasks with dependencies
5. Monitor project progress and budget

### Team Leader Workflow
1. View assigned project
2. Break main tasks into subtasks
3. Assign subtasks to members
4. Track team progress

### Member Workflow
1. View assigned projects and tasks
2. Update task status (Kanban board)
3. Log time on tasks
4. Collaborate in real-time

---

## 🔌 API Documentation

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Super Admin Routes
```http
GET    /api/superadmin/analytics
GET    /api/superadmin/organizations
POST   /api/superadmin/organizations
DELETE /api/superadmin/organizations/:id
POST   /api/superadmin/admins
```

### Admin Routes
```http
GET    /api/admin/users
POST   /api/admin/assign-pm
DELETE /api/admin/unassign-pm/:userId
PUT    /api/admin/users/:userId/role
GET    /api/admin/analytics
```

### Project Manager Routes
```http
GET    /api/pm/dashboard
GET    /api/pm/projects
POST   /api/pm/projects
GET    /api/pm/projects/:projectId
PUT    /api/pm/projects/:projectId
DELETE /api/pm/projects/:projectId
POST   /api/pm/projects/:projectId/members
DELETE /api/pm/projects/:projectId/members/:userId
PUT    /api/pm/projects/:projectId/team-leader
```

### Task Routes
```http
GET    /api/pm/projects/:projectId/tasks
POST   /api/pm/projects/:projectId/tasks
PUT    /api/pm/tasks/:taskId
DELETE /api/pm/tasks/:taskId
POST   /api/pm/tasks/:taskId/dependencies
DELETE /api/pm/tasks/:taskId/dependencies/:depId
```

See `server/routes/` for complete API documentation.

---

## ✅ Validations & Innovations

### Three-Layer Validation System

**Layer 1: HTML5 Browser Validation**
- Date inputs with `min` attribute
- Required field enforcement
- Email format validation

**Layer 2: JavaScript Client-Side Validation**
- Date comparison (no past dates)
- Capacity checks before submission
- Enum value verification
- Shows user-friendly error messages

**Layer 3: MongoDB/Backend Validation**
- Mongoose schema validation
- Business logic validation
- Database constraint enforcement
- Prevents API manipulation

### Key Validations Implemented

#### Date Validations
- **Task Due Date**: Cannot be in past (HTML5 min + JS + Backend)
- **Sprint Dates**: Start date ≥ today, End date > Start date
- **Project Dates**: StartDate < EndDate

#### Capacity Validations
- **Members**: Max 5 projects per member
- **Team Leaders**: Max 1 team leader role + 4 member roles
- **Project Managers**: Configurable (1-20 projects)

#### Enum Validations
- **User Specializations**: 20 valid types (snake_case format)
- **Task Specializations**: 8 valid types (ui_ux_designer, software_engineer, etc.)
- **User Roles**: 7 valid roles (super_admin, admin, project_manager, etc.)
- **Task Status**: todo, in_progress, review, completed, cancelled
- **Priority Levels**: low, medium, high, urgent

#### Business Logic Validations
- Cannot delete organization with active users
- Cannot remove PM with active projects
- Cannot change super_admin role
- Member must exist in project to be assigned task
- Tasks must be in same project to have dependencies
- Cannot create circular task dependencies
- Cannot create self-referencing task dependencies

### Innovative Features Summary

1. **Multi-Tenant Architecture**: Complete organization isolation
2. **Real-Time Updates**: Socket.IO for live collaboration
3. **Intelligent Capacity Management**: Prevents overallocation
4. **Task Dependency Graphs**: Automatic blocking status
5. **Project Weighting System**: Auto complexity calculation
6. **Specialization Matching**: Skills-based assignments
7. **MongoDB Aggregation**: Complex analytics without N+1 queries
8. **Cascade Operations**: Safe deletes maintaining data integrity

---

## 🧪 Testing

### Manual Testing Guides

Comprehensive testing documentation available:

- `TESTING_GUIDE.md` - General testing procedures
- `TEST_TASK_MANAGEMENT_GUIDE.md` - Task feature testing
- `TEST_REALTIME_GUIDE.md` - Socket.IO testing
- `TEST_PHASE9_GUIDE.md` - Module-specific tests
- `SPECIALIZATION_TESTING_GUIDE.md` - Specialization system

### Testing Scenarios

**Super Admin Module**:
- ✅ Create organization with duplicate slug (should fail)
- ✅ Delete organization with users (should fail)
- ✅ Create admin with duplicate email (should fail)

**Admin Module**:
- ✅ Assign PM beyond capacity (should fail)
- ✅ Remove PM with active projects (should fail)
- ✅ Change super_admin role (should fail)

**Project Management**:
- ✅ Add member at capacity (should fail)
- ✅ Assign 2nd team leader role (should fail)
- ✅ Add already-existing member (should fail)

**Task Management**:
- ✅ Create task with past due date (should fail)
- ✅ Add circular dependency (should fail)
- ✅ Assign to non-project member (should fail)

### Run Tests

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

---

## 📚 Additional Documentation

- **[Viva Preparation Guide](viva-preparation-a--guide.plan.md)** - Comprehensive viva presentation guide
- **[Technical Documentation](docs/TECHNICAL_DOCS.md)** - Architecture deep dive
- **[User Guide](docs/USER_GUIDE.md)** - End-user documentation
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API reference
- **[Architecture Overview](docs/ARCHITECTURE.md)** - System design patterns

### Validation Documentation
- `FIX_SPECIALIZATION_ENUM_ERROR.md` - Enum validation implementation
- `TASK_DUE_DATE_VALIDATION.md` - Date validation system
- `SPRINT_DATE_VALIDATION.md` - Sprint date validation

### Feature Documentation
- `MEMBER_MANAGEMENT_COMPLETE.md` - Member management features
- `FRONTEND_TEAM_MANAGEMENT_COMPLETE.md` - Team UI features
- `FLOATING_CHAT_ALL_USERS_COMPLETE.md` - Real-time chat

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Use ES6+ JavaScript features
- Follow Airbnb style guide
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

**Noye Seyon** - [GitHub](https://github.com/NoyeSeyon)

---

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- React team for the amazing framework
- Socket.IO for real-time capabilities
- Tailwind CSS for beautiful styling
- All contributors and testers

---

## 📞 Support

For issues, questions, or support:
- **Email**: seyonoyes@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/NoyeSeyon/ProJectra_Agile/issues)

---

## 🎓 Academic Project

This project was developed as part of an academic assignment demonstrating:
- Full-stack MERN development
- Multi-tenant SaaS architecture
- Real-time web applications
- Agile project management concepts
- Comprehensive validation systems
- Modern UI/UX design principles

**Course**: [Your Course Name]  
**Institution**: [Your Institution]  
**Date**: October 2024

---

**⭐ If you find this project useful, please consider giving it a star on GitHub!**

