# Projectra - Agile Project Management System

A comprehensive MERN stack application for agile project management with multi-tenant support, real-time collaboration, and advanced analytics.

## 🚀 Features

### Core Features
- **Multi-tenant Architecture** - Support for multiple organizations
- **Role-Based Access Control** - 7 distinct user roles with hierarchical permissions
- **Agile Methodology** - Full Scrum/Kanban implementation
- **Real-time Collaboration** - Socket.io powered live updates
- **Advanced Analytics** - ApexCharts integration with comprehensive reporting
- **AI Assistant** - Contextual help and automation
- **Slack Integration** - Notifications and chat bridge
- **File Management** - Cloud storage with attachment support

### User Roles
1. **Projectra Admin (Super Admin)** - Platform management
2. **Admin (Organization Owner)** - Organization management
3. **Project Manager** - Project oversight and team selection
4. **Team Leader** - Task breakdown and team coordination
5. **Member** - Task execution with specializations
6. **Client** - Project monitoring and communication
7. **Guest** - Limited trial access

### Member Specializations
- UI/UX Designer
- Software Engineer
- QA Engineer
- DevOps Engineer
- Product Manager
- Business Analyst
- Data Analyst
- Marketing Specialist

## 🏗️ Architecture

### Backend (Node.js/Express)
```
server/
├── models/           # MongoDB schemas
├── routes/           # API endpoints
├── controllers/      # Business logic
├── middleware/       # Authentication & validation
├── services/         # External integrations
├── config/           # Configuration files
└── tests/           # Test suites
```

### Frontend (React)
```
client/
├── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # Route components
│   ├── contexts/     # State management
│   ├── hooks/        # Custom React hooks
│   ├── services/     # API services
│   ├── utils/        # Helper functions
│   └── styles/       # Styling
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **ApexCharts** - Data visualization
- **@dnd-kit** - Drag and drop
- **Axios** - HTTP client

### DevOps
- **MongoDB Atlas** - Cloud database
- **Git** - Version control
- **Docker** - Containerization (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd C-Projectra
```

2. **Install dependencies**
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

3. **Environment Setup**
```bash
# Copy environment files
cp server/config.env.example server/config.env
cp client/.env.example client/.env
```

4. **Configure Environment Variables**
```bash
# server/config.env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
NODE_ENV=development

# client/.env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_CLIENT_URL=http://localhost:3000
```

5. **Start the application**
```bash
# Start server (from root directory)
npm run dev:server

# Start client (from root directory)
npm run dev:client
```

## 📊 Database Schema

### Core Models
- **User** - User accounts with roles and specializations
- **Organization** - Multi-tenant organizations
- **Project** - Projects with Agile configuration
- **Task** - Tasks with subtasks and story points
- **Sprint** - Sprint management with burndown
- **Team** - Team structure and capacity
- **Activity** - System activity logging
- **Notification** - User notifications
- **SystemFeature** - Platform feature management
- **AuditLog** - Security audit trail

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Rate limiting
- Input validation
- Audit logging
- Security headers

## 📈 Analytics & Reporting

- Project progress tracking
- Sprint velocity metrics
- Team performance analytics
- Budget tracking
- Burndown charts
- Custom reports
- Export functionality

## 🤖 AI Integration

- Contextual Q&A assistant
- Project recommendations
- Automated insights
- Smart notifications
- Workflow optimization

## 🔗 Integrations

- **Slack** - Notifications and chat
- **Email** - Invitations and alerts
- **File Storage** - Cloud attachments
- **Analytics** - Advanced reporting

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## 📚 Documentation

- [API Documentation](API_DOCUMENTATION.md)
- [User Guide](USER_GUIDE.md)
- [Technical Architecture](TECHNICAL.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Agile Methodology](AGILE_METHODOLOGY.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added AI assistant and advanced analytics
- **v1.2.0** - Enhanced security and audit features
- **v1.3.0** - Projectra Admin and multi-organization support

---

**Built with ❤️ by the Projectra Team**

