# Projectra File Structure Documentation

## Complete Project Structure

```
C-Projectra/
├── 📁 client/                          # React Frontend Application
│   ├── 📁 public/                      # Static assets
│   │   ├── index.html                  # Main HTML template
│   │   ├── favicon.ico                 # Site icon
│   │   └── 📁 assets/                  # Static resources
│   │       ├── 📁 images/              # Image files
│   │       └── 📁 icons/               # Icon files
│   │
│   ├── 📁 src/                         # Source code
│   │   ├── index.js                    # Application entry point
│   │   ├── App.js                      # Main app component
│   │   ├── index.css                   # Global styles
│   │   │
│   │   ├── 📁 components/              # Reusable UI components
│   │   │   ├── 📁 common/              # Shared components
│   │   │   │   ├── Button.js           # Reusable button component
│   │   │   │   ├── Modal.js            # Modal dialog component
│   │   │   │   ├── Table.js            # Data table component
│   │   │   │   ├── Card.js             # Card layout component
│   │   │   │   ├── LoadingSpinner.js   # Loading indicator
│   │   │   │   ├── ErrorBoundary.js    # Error handling
│   │   │   │   └── Toast.js            # Notification toast
│   │   │   │
│   │   │   ├── 📁 layout/              # Layout components
│   │   │   │   ├── Layout.js           # Main layout wrapper
│   │   │   │   ├── Header.js           # Application header
│   │   │   │   ├── Sidebar.js          # Navigation sidebar
│   │   │   │   ├── Footer.js           # Application footer
│   │   │   │   └── Breadcrumb.js       # Navigation breadcrumb
│   │   │   │
│   │   │   ├── 📁 dashboard/           # Dashboard widgets
│   │   │   │   ├── StatsCard.js        # Statistics cards
│   │   │   │   ├── RecentProjects.js   # Recent projects widget
│   │   │   │   ├── RecentTasks.js      # Recent tasks widget
│   │   │   │   └── ActivityFeed.js     # Activity feed widget
│   │   │   │
│   │   │   ├── 📁 kanban/              # Kanban board components
│   │   │   │   ├── KanbanBoard.js      # Main kanban board
│   │   │   │   ├── KanbanColumn.js     # Kanban column
│   │   │   │   ├── KanbanCard.js       # Kanban card
│   │   │   │   └── CardModal.js        # Card detail modal
│   │   │   │
│   │   │   ├── 📁 analytics/           # Chart components
│   │   │   │   ├── BurndownChart.js    # Sprint burndown chart
│   │   │   │   ├── VelocityChart.js   # Team velocity chart
│   │   │   │   ├── BudgetChart.js      # Budget tracking chart
│   │   │   │   ├── ProgressGauge.js    # Progress gauge
│   │   │   │   └── TimelineChart.js    # Project timeline
│   │   │   │
│   │   │   ├── 📁 agile/               # Agile-specific components
│   │   │   │   ├── SprintBoard.js      # Sprint planning board
│   │   │   │   ├── BacklogList.js      # Product backlog
│   │   │   │   ├── DailyStandup.js     # Daily standup
│   │   │   │   ├── PlanningPoker.js    # Story point estimation
│   │   │   │   └── Retrospective.js    # Sprint retrospective
│   │   │   │
│   │   │   ├── 📁 project/             # Project components
│   │   │   │   ├── ProjectCard.js      # Project card display
│   │   │   │   ├── ProjectForm.js      # Project creation/edit form
│   │   │   │   ├── ProjectWeightCalculator.js # Project weight calculation
│   │   │   │   └── MemberSelector.js   # Team member selection
│   │   │   │
│   │   │   ├── 📁 task/                # Task components
│   │   │   │   ├── TaskCard.js         # Task card display
│   │   │   │   ├── TaskForm.js         # Task creation/edit form
│   │   │   │   ├── TaskBreakdown.js    # Task breakdown view
│   │   │   │   └── SubtaskList.js      # Subtask management
│   │   │   │
│   │   │   ├── 📁 client/              # Client-specific components
│   │   │   │   ├── ClientDashboard.js  # Client dashboard
│   │   │   │   ├── BudgetTracker.js    # Budget tracking
│   │   │   │   ├── ClientProgress.js   # Progress visualization
│   │   │   │   └── ClientChat.js       # Client communication
│   │   │   │
│   │   │   ├── 📁 super-admin/         # Projectra Admin components
│   │   │   │   ├── OrganizationList.js # Organization management
│   │   │   │   ├── OrganizationForm.js # Organization form
│   │   │   │   ├── FeatureToggle.js   # Feature management
│   │   │   │   ├── SecuritySettings.js # Security configuration
│   │   │   │   └── VersionManager.js   # Version management
│   │   │   │
│   │   │   ├── 📁 member/              # Member components
│   │   │   │   ├── MemberCard.js       # Member profile card
│   │   │   │   ├── WorkloadIndicator.js # Workload visualization
│   │   │   │   ├── MemberManagement.js # Member management
│   │   │   │   └── SkillBadge.js       # Skill display
│   │   │   │
│   │   │   ├── 📁 communication/       # Communication components
│   │   │   │   ├── ClientCommunication.js # Client communication
│   │   │   │   ├── ChatWindow.js       # Real-time chat
│   │   │   │   ├── MessageThread.js    # Message threading
│   │   │   │   └── NotificationCenter.js # Notification center
│   │   │   │
│   │   │   └── FloatingChatAndAI.js    # AI Assistant (WhatsApp-style)
│   │   │
│   │   ├── 📁 pages/                   # Page components
│   │   │   ├── 📁 auth/                # Authentication pages
│   │   │   │   ├── Login.js            # User login
│   │   │   │   ├── Register.js         # User registration
│   │   │   │   ├── ForgotPassword.js   # Password recovery
│   │   │   │   └── ResetPassword.js    # Password reset
│   │   │   │
│   │   │   ├── 📁 super-admin/         # Projectra Admin pages
│   │   │   │   ├── SuperAdminDashboard.js # Super admin dashboard
│   │   │   │   ├── OrganizationManagement.js # Organization CRUD
│   │   │   │   ├── FeatureManagement.js # Feature toggles
│   │   │   │   ├── SecurityManagement.js # Security settings
│   │   │   │   ├── SystemAnalytics.js  # System-wide analytics
│   │   │   │   └── VersionControl.js   # Version management
│   │   │   │
│   │   │   ├── 📁 admin/               # Organization Admin pages
│   │   │   │   ├── AdminDashboard.js   # Admin dashboard
│   │   │   │   ├── PMManagement.js     # Project manager management
│   │   │   │   ├── AdminAnalytics.js   # Organization analytics
│   │   │   │   └── OrganizationSettings.js # Organization settings
│   │   │   │
│   │   │   ├── 📁 pm/                  # Project Manager pages
│   │   │   │   ├── PMDashboard.js      # PM dashboard
│   │   │   │   ├── PMProjects.js       # Project management
│   │   │   │   ├── PMAnalytics.js      # PM analytics
│   │   │   │   └── TeamSelection.js    # Team member selection
│   │   │   │
│   │   │   ├── 📁 team-leader/         # Team Leader pages
│   │   │   │   ├── TLDashboard.js      # Team leader dashboard
│   │   │   │   ├── TaskBreakdown.js    # Task breakdown
│   │   │   │   ├── SprintPlanning.js   # Sprint planning
│   │   │   │   └── TLAnalytics.js      # Team leader analytics
│   │   │   │
│   │   │   ├── 📁 member/              # Member pages
│   │   │   │   ├── MemberDashboard.js  # Member dashboard
│   │   │   │   ├── MyTasks.js          # Personal task management
│   │   │   │   ├── MyProjects.js       # Assigned projects
│   │   │   │   └── MemberAnalytics.js  # Personal analytics
│   │   │   │
│   │   │   ├── 📁 client/              # Client pages
│   │   │   │   ├── ClientDashboard.js  # Client dashboard
│   │   │   │   ├── ClientProjects.js   # Project monitoring
│   │   │   │   └── ClientCommunication.js # Client communication
│   │   │   │
│   │   │   ├── Dashboard.js            # Main dashboard (role-based)
│   │   │   ├── Projects.js             # Projects listing
│   │   │   ├── ProjectDetail.js        # Project details
│   │   │   ├── Tasks.js                # Tasks listing
│   │   │   ├── KanbanBoard.js          # Kanban board page
│   │   │   ├── Analytics.js            # Analytics page
│   │   │   ├── Settings.js             # Settings page
│   │   │   ├── Profile.js              # User profile
│   │   │   ├── TeamMembers.js          # Team members
│   │   │   ├── Backlog.js              # Backlog management
│   │   │   ├── SprintManagement.js     # Sprint management
│   │   │   ├── SprintRetrospective.js  # Sprint retrospective
│   │   │   └── Feedback.js             # Feedback system
│   │   │
│   │   ├── 📁 contexts/                # React Context API
│   │   │   ├── AuthContext.js          # Authentication state
│   │   │   ├── ThemeContext.js         # Theme management
│   │   │   ├── SocketContext.js        # Real-time connection
│   │   │   ├── ProjectContext.js       # Project state
│   │   │   └── NotificationContext.js  # Notification state
│   │   │
│   │   ├── 📁 hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js              # Authentication utilities
│   │   │   ├── useProject.js           # Project management
│   │   │   ├── useTask.js              # Task operations
│   │   │   ├── useCapacity.js          # Resource management
│   │   │   ├── useSprint.js            # Sprint management
│   │   │   └── useRealtime.js          # Real-time updates
│   │   │
│   │   ├── 📁 services/                # API services
│   │   │   ├── api.js                  # Axios instance
│   │   │   ├── authService.js          # Authentication API
│   │   │   ├── projectService.js       # Project API
│   │   │   ├── taskService.js          # Task API
│   │   │   ├── sprintService.js        # Sprint API
│   │   │   ├── analyticsService.js     # Analytics API
│   │   │   ├── memberService.js        # Member API
│   │   │   ├── clientService.js        # Client API
│   │   │   └── superAdminService.js    # Super Admin API
│   │   │
│   │   ├── 📁 utils/                   # Utility functions
│   │   │   ├── validators.js           # Input validation
│   │   │   ├── formatters.js           # Data formatting
│   │   │   ├── constants.js            # Application constants
│   │   │   ├── helpers.js              # Helper functions
│   │   │   └── permissions.js          # Permission utilities
│   │   │
│   │   ├── 📁 styles/                  # Styling
│   │   │   ├── design-system.css       # Design system
│   │   │   ├── animations.css          # Animation styles
│   │   │   └── responsive.css          # Responsive styles
│   │   │
│   │   └── 📁 __tests__/               # Frontend tests
│   │       ├── 📁 components/          # Component tests
│   │       ├── 📁 pages/               # Page tests
│   │       └── 📁 hooks/               # Hook tests
│   │
│   ├── package.json                    # Frontend dependencies
│   ├── tailwind.config.js              # Tailwind configuration
│   ├── postcss.config.js               # PostCSS configuration
│   └── .env                            # Frontend environment
│
├── 📁 server/                          # Node.js Backend
│   ├── 📁 models/                      # MongoDB models
│   │   ├── User.js                     # User model (all roles)
│   │   ├── Organization.js             # Organization/Company
│   │   ├── Project.js                  # Project with agile
│   │   ├── Task.js                     # Tasks with subtasks
│   │   ├── Sprint.js                   # Sprint management
│   │   ├── Team.js                     # Team structure
│   │   ├── KanbanColumn.js             # Kanban columns
│   │   ├── KanbanCard.js               # Kanban cards
│   │   ├── Channel.js                  # Chat channels
│   │   ├── Message.js                  # Messages
│   │   ├── Invitation.js               # Member invitations
│   │   ├── Settings.js                 # Organization settings
│   │   ├── Feedback.js                 # Feedback system
│   │   ├── ClientDashboard.js          # Client dashboard config
│   │   ├── Activity.js                 # Activity logging
│   │   ├── Notification.js             # Notifications
│   │   ├── SystemFeature.js            # Platform features
│   │   └── AuditLog.js                 # Security audit
│   │
│   ├── 📁 routes/                      # API routes
│   │   ├── auth.js                     # Authentication
│   │   ├── super-admin.js              # Projectra Admin routes
│   │   ├── admin.js                    # Org Admin routes
│   │   ├── pm.js                       # Project Manager routes
│   │   ├── team-leader.js              # Team Leader routes
│   │   ├── organizations.js            # Organization CRUD
│   │   ├── users.js                    # User management
│   │   ├── projects.js                 # Project management
│   │   ├── tasks.js                    # Task management
│   │   ├── sprints.js                  # Sprint management
│   │   ├── kanban.js                   # Kanban operations
│   │   ├── chat.js                     # Chat/messaging
│   │   ├── client.js                   # Client dashboard
│   │   ├── invitations.js              # Invitations
│   │   ├── analytics.js                # Analytics data
│   │   ├── feedback.js                 # Feedback system
│   │   ├── ai.js                       # AI assistant
│   │   ├── integrations.js             # Slack, etc.
│   │   ├── settings.js                 # Settings
│   │   ├── upload.js                   # File uploads
│   │   ├── reports.js                  # Report generation
│   │   └── notifications.js            # Notifications
│   │
│   ├── 📁 middleware/                  # Express middleware
│   │   ├── auth.js                     # JWT authentication
│   │   ├── roleCheck.js                # RBAC middleware
│   │   ├── capacityCheck.js           # Member capacity
│   │   ├── validation.js               # Input validation
│   │   ├── errorHandler.js             # Error handling
│   │   ├── rateLimiter.js              # Rate limiting
│   │   └── auditLogger.js              # Audit logging
│   │
│   ├── 📁 controllers/                 # Business logic
│   │   ├── authController.js           # Authentication logic
│   │   ├── projectController.js        # Project management
│   │   ├── taskController.js           # Task operations
│   │   ├── sprintController.js         # Sprint management
│   │   ├── memberController.js         # Team management
│   │   ├── clientController.js         # Client dashboard
│   │   └── superAdminController.js     # Platform management
│   │
│   ├── 📁 services/                    # Service layer
│   │   ├── emailService.js             # Email notifications
│   │   ├── slackService.js             # Slack integration
│   │   ├── aiService.js                # OpenAI integration
│   │   ├── storageService.js           # File storage
│   │   ├── analyticsService.js         # Analytics calculations
│   │   ├── capacityService.js          # Capacity management
│   │   └── notificationService.js      # Notifications
│   │
│   ├── 📁 utils/                       # Utility functions
│   │   ├── validators.js               # Input validation
│   │   ├── helpers.js                  # Helper functions
│   │   ├── constants.js                # Application constants
│   │   ├── permissions.js              # Permission utilities
│   │   └── errorCodes.js               # Error code definitions
│   │
│   ├── 📁 config/                      # Configuration
│   │   ├── database.js                 # Database configuration
│   │   ├── socket.js                   # Socket.io configuration
│   │   ├── upload.js                   # Multer configuration
│   │   └── redis.js                    # Redis configuration
│   │
│   ├── 📁 tests/                       # Backend tests
│   │   ├── 📁 unit/                    # Unit tests
│   │   ├── 📁 integration/             # Integration tests
│   │   └── 📁 e2e/                     # End-to-end tests
│   │
│   ├── index.js                        # Server entry point
│   ├── package.json                    # Backend dependencies
│   ├── config.env                      # Environment variables
│   └── .env.example                    # Environment template
│
├── 📁 docs/                            # Documentation
│   ├── README.md                       # Main documentation
│   ├── API_DOCUMENTATION.md            # API reference
│   ├── USER_GUIDE.md                   # User manual
│   ├── TECHNICAL.md                    # Technical documentation
│   ├── ARCHITECTURE.md                 # Architecture design
│   ├── DEPLOYMENT.md                   # Deployment guide
│   ├── AGILE_METHODOLOGY.md            # Agile implementation
│   ├── ROLE_HIERARCHY.md               # Role documentation
│   ├── WORKFLOW_DIAGRAMS.md            # Workflow descriptions
│   ├── DATABASE_SCHEMA.md              # Schema documentation
│   ├── SECURITY.md                     # Security practices
│   ├── FILE_STRUCTURE.md               # File structure guide
│   ├── PROJECT_REPORT.pdf              # Final project report
│   └── 📁 images/                      # Documentation images
│       ├── architecture.png            # System architecture
│       ├── role-hierarchy.png          # Role hierarchy diagram
│       ├── 📁 workflows/               # Workflow diagrams
│       └── 📁 screenshots/             # Application screenshots
│
├── 📁 tests/                           # Integration tests
│   ├── 📁 integration/                 # Integration test suites
│   └── 📁 e2e/                         # End-to-end tests
│
├── 📁 scripts/                         # Utility scripts
│   ├── seed.js                         # Database seeding
│   ├── deploy.js                       # Deployment script
│   └── backup.js                       # Backup script
│
├── .gitignore                          # Git ignore rules
├── .eslintrc.json                      # ESLint configuration
├── .prettierrc                         # Prettier configuration
├── package.json                        # Root package.json
└── README.md                           # Project overview
```

## File Structure Benefits for Viva

### 1. **Clear Organization**
- **156+ organized files** with logical grouping
- **Role-based folder structure** for easy navigation
- **MVC pattern** with service layer separation
- **Feature-based organization** for scalability

### 2. **Professional Structure**
- **Separation of concerns** - Each folder has specific responsibility
- **Scalable architecture** - Easy to add new features
- **Maintainable codebase** - Clear file locations
- **Team collaboration** - No file conflicts

### 3. **Easy to Explain**
- **Intuitive naming** - Folder names explain purpose
- **Logical hierarchy** - Clear parent-child relationships
- **Consistent patterns** - Similar files grouped together
- **Documentation ready** - Self-documenting structure

### 4. **Development Benefits**
- **Parallel development** - Team members work on different folders
- **Version control** - Clean Git history
- **Code reviews** - Easy to locate changes
- **Testing** - Organized test structure

### 5. **Viva Presentation Points**

#### **Backend Architecture (MVC + Service Layer)**
```
Models → Controllers → Services → Routes → Middleware
```

#### **Frontend Architecture (Component-Based)**
```
Pages → Components → Hooks → Services → Utils
```

#### **Role-Based Organization**
- **7 user roles** with dedicated pages and components
- **Hierarchical permissions** with clear separation
- **Multi-tenant support** with organization isolation

#### **Agile Implementation**
- **Sprint management** with burndown charts
- **Task breakdown** with subtasks and story points
- **Team capacity** management with workload indicators
- **Client dashboard** with real-time progress tracking

#### **Security & Audit**
- **Comprehensive audit logging** for all activities
- **Role-based access control** with fine-grained permissions
- **Multi-tenant data isolation** for security
- **Activity tracking** for compliance

This file structure demonstrates **professional software development practices** and is ready for **viva presentation** with clear explanations of each component's purpose and relationship to the overall system architecture.

