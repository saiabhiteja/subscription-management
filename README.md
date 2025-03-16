# Subscription Management System

subscription management system that helps users track, manage, and receive timely reminders for their recurring subscriptions, preventing unwanted charges and optimizing spending.

## Content Structer
```
subdub/
├── 📄 app.js                          # Application entry point
├── 📦 package.json                    # NPM package configuration
├── 📦 package-lock.json               # NPM dependency lock file
├── 📝 README.md                       # Project documentation
├── 🙈 .gitignore                      # Git ignore file
├── 🧹 eslint.config.js                # ESLint configuration
│
├── ⚙️ config/                         # Configuration files
│   ├── 🛡️ arcjet.js                   # Arcjet bot protection config
│   ├── 📊 constants.js                # Application constants
│   ├── 🔑 env.js                      # Environment variables
│   ├── 📧 nodemailer.js               # Email configuration
│   └── 🔄 upstash.js                  # Upstash workflow configuration
│
├── 🎮 controllers/                    # Request handlers
│   ├── 🔐 auth.controller.js          # Authentication logic
│   ├── 📈 dashboard.controller.js     # Dashboard data
│   ├── 💳 subscriptions.controller.js # Subscription management
│   ├── 👤 user.controller.js          # User management
│   └── ⏱️ workflow.controller.js      # Workflow triggers
│
├── 💾 database/                       # Database connection
│   └── 🍃 mongodb.js                  # MongoDB connection setup
│
├── 🔌 middlewares/                    # Express middlewares
│   ├── 🛡️ arcjet.middleware.js        # Bot protection
│   ├── 🔐 auth.middleware.js          # Authentication and authorization
│   ├── ❌ error.middleware.js         # Global error handling
│   └── ✅ validation.middleware.js    # Request validation
│
├── 📊 models/                         # Database models
│   ├── 💳 subscription.model.js       # Subscription schema
│   └── 👤 user.model.js               # User schema
│
├── 🛣️ routes/                         # API routes
│   ├── 🔐 auth.routes.js              # Authentication routes
│   ├── 📈 dashboard.routes.js         # Dashboard routes
│   ├── 💳 subscriptions.routes.js     # Subscription routes
│   ├── 👤 user.routes.js              # User routes
│   └── ⏱️ workflow.routes.js          # Workflow routes
│
├── 🛠️ utils/                          # Utility functions
│   ├── 📅 date.utils.js               # Date manipulation helpers
│   ├── 📧 email-template.js           # Email templates
│   ├── 📝 logger.js                   # Logging configuration
│   └── 📨 send-email.js               # Email sending functions
│
├── ✅ validators/                     # Input validation
│   ├── 🔐 auth.validator.js           # Authentication validation
│   ├── 💳 subscriptions.validator.js  # Subscription validation
│   └── 👤 user.validator.js           # User validation
│
└── 📊 logs/                           # Application logs
    ├── 📝 combined.log                # Combined logs
    └── ❌ error.log                   # Error logs
```

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Subscriptions](#subscriptions)
  - [Dashboard](#dashboard)
  - [Workflows](#workflows)
- [Data Models](#data-models)
- [Security](#security)
- [Email System](#email-system)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- 👤 **User Authentication**: Secure JWT-based authentication system
- 📊 **User Dashboard**: Personalized dashboard with subscription analytics and insights
- 📅 **Subscription Tracking**: Manage and monitor all subscriptions in one place
- 📧 **Email Reminders**: Automated email reminders for upcoming subscription renewals
- 📱 **Subscription Management**: Add, update, cancel, and track subscription details
- 📈 **Spending Analytics**: Visualize monthly spending and subscription distribution
- 🔒 **Role-Based Access**: Admin and user role segregation
- 🤖 **Bot Protection**: Advanced protection using Arcjet shield
- ⏱️ **Workflow Automation**: Reliable reminder workflows with Upstash

## Architecture

### System Architecture

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│   Client UI   │◄────►│  Express API  │◄────►│   MongoDB     │
└───────────────┘      └───────┬───────┘      └───────────────┘
                              │
                 ┌────────────┼────────────┐
                 ▼             ▼            ▼
        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │  Email      │ │  Upstash    │ │  Arcjet     │
        │  Service    │ │  Workflow   │ │  Protection │
        └─────────────┘ └─────────────┘ └─────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────┐
│                      app.js                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │ Routes  │ │ Config  │ │ Middle- │ │ Error   │    │
│  │         │ │         │ │ wares   │ │ Handler │    │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
└──────────────────────┬──────────────────────────────┘
                       │
┌─────────────────────▼──────────────────────────────┐
│                    Routes                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Auth    │ │ User    │ │ Subscr- │ │ Workflow│   │
│  │         │ │         │ │ iption  │ │         │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└──────────────────────┬─────────────────────────────┘
                       │
┌─────────────────────▼──────────────────────────────┐
│                  Controllers                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Auth    │ │ User    │ │ Subscr- │ │ Workflow│   │
│  │         │ │         │ │ iption  │ │         │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└──────────────────────┬─────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────┐
│                    Models                          │
│  ┌─────────┐              ┌─────────┐              │
│  │ User    │              │ Subscr- │              │
│  │         │              │ iption  │              │
│  └─────────┘              └─────────┘              │
└────────────────────────────────────────────────────┘
```

### Workflow System Architecture

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│  Subscription │      │  Upstash      │      │  Email        │
│  Created      │─────►│  Workflow     │─────►│  Service      │
└───────────────┘      └───────────────┘      └───────────────┘
                               │
                               │ Schedule reminders
                               ▼
┌───────────────┐      ┌───────────────┐
│  User         │◄─────│  Reminder     │
│  Notified     │      │  Triggers     │
└───────────────┘      └───────────────┘
```

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer with Gmail transport
- **Workflow Automation**: Upstash Workflow
- **Security**: 
  - Helmet (HTTP headers)
  - CORS
  - Rate limiting
  - Arcjet (bot protection)
- **Validation**: Express Validator

### Development Tools
- **Package Manager**: npm
- **Environment**: dotenv for configuration
- **Logging**: Winston & Morgan
- **Code Quality**: ESLint
- **Testing**: Jest & Supertest

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Upstash account for workflow automation
- Arcjet account for bot protection
- Gmail account for sending emails (or other email service)

### Installation

1. Clone the repository:
   ```bash
   https://github.com/saiabhiteja/subscription-management
   cd subscription-management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create `.env.development.local` file with the following variables:
   ```env
   # Server
   PORT=5500
   SERVER_URL=http://localhost:5500
   NODE_ENV=development
   
   # Database
   DB_URI=mongodb://localhost:27017/subdub
   
   # Authentication
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=30d
   
   # Email
   EMAIL_PASSWORD=your_email_password
   
   # Arcjet (Bot Protection)
   ARCJET_KEY=your_arcjet_key
   ARCJET_ENV=development
   
   # Upstash Workflow
   QSTASH_TOKEN=your_qstash_token
   QSTASH_URL=https://qstash.upstash.io/v1/publish
   
   # Client (for email links)
   CLIENT_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The API will be available at `http://localhost:5500`

### Environment Setup

For production, create `.env.production.local` with appropriate production settings.

## API Documentation

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/auth/sign-up` | Register a new user | Public |
| POST | `/api/v1/auth/sign-in` | Login and get token | Public |
| POST | `/api/v1/auth/sign-out` | Logout (client-side token removal) | Public |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/users` | Get all users | Admin |
| GET | `/api/v1/users/profile` | Get current user's profile | Private |
| GET | `/api/v1/users/:id` | Get user by ID | Private |
| PUT | `/api/v1/users/:id` | Update user | Private |
| PUT | `/api/v1/users/password` | Change password | Private |
| DELETE | `/api/v1/users/:id` | Delete user | Admin |

### Subscriptions

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/subscriptions` | Get all subscriptions | Admin/Private |
| GET | `/api/v1/subscriptions/upcoming-renewals` | Get upcoming renewals | Private |
| GET | `/api/v1/subscriptions/user/:id` | Get user's subscriptions | Private |
| GET | `/api/v1/subscriptions/:id` | Get subscription by ID | Private |
| POST | `/api/v1/subscriptions` | Create new subscription | Private |
| PUT | `/api/v1/subscriptions/:id` | Update subscription | Private |
| PUT | `/api/v1/subscriptions/:id/cancel` | Cancel subscription | Private |
| DELETE | `/api/v1/subscriptions/:id` | Delete subscription | Private |

### Dashboard

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/dashboard` | Get user dashboard data | Private |
| GET | `/api/v1/dashboard/admin` | Get admin dashboard | Admin |

### Workflows

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/workflows/subscriptions/reminder` | Trigger subscription reminder | Private (QStash) |
| POST | `/api/v1/workflows/subscriptions/cancel` | Cancel reminders | Private (QStash) |

## Data Models

### User Model

```javascript
{
  name: String,           // User's full name
  email: String,          // User's email (unique)
  password: String,       // Hashed password
  role: String,           // 'user' or 'admin'
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Subscription Model

```javascript
{
  name: String,           // Subscription name
  price: Number,          // Subscription price
  currency: String,       // 'USD', 'EUR', 'GBP'
  frequency: String,      // 'daily', 'weekly', 'monthly', 'yearly'
  category: String,       // 'sports', 'news', 'entertainment', etc.
  paymentMethod: String,  // Payment method used
  status: String,         // 'active', 'cancelled', 'expired'
  startDate: Date,        // When subscription started
  renewalDate: Date,      // Next renewal date
  user: ObjectId,         // Reference to User model
  createdAt: Date,
  updatedAt: Date
}
```

## Security

SubDub implements several security measures:

1. **Authentication**: JWT-based authentication for API access
2. **Password Security**: Bcrypt for password hashing
3. **HTTP Security Headers**: Using Helmet middleware
4. **CORS Protection**: Configured with appropriate origins
5. **Rate Limiting**: Prevents brute force attacks
6. **Input Validation**: Validation for all incoming data
7. **Bot Protection**: Using Arcjet to detect and block malicious bots
8. **MongoDB Security**: Proper validation and sanitization
9. **Error Handling**: Structured error responses without leaking sensitive information

## Email System

SubDub uses a comprehensive email notification system:

1. **Reminders**: Automatic emails at 7, 5, 2, and 1 days before renewal
2. **Customizable Templates**: Professional HTML email templates
3. **Welcome Emails**: For new user registration
4. **Password Reset**: Secure password reset workflow
5. **Responsive Design**: Mobile-friendly email templates

<!-- ## Deployment

### Deployment Options

1. **Traditional Hosting**:
   - Provision Node.js server
   - Set up MongoDB
   - Configure environment variables
   - Deploy using PM2 or similar process manager

2. **Docker Deployment**:
   ```bash
   # Build Docker image
   docker build -t subdub-api .
   
   # Run container
   docker run -p 5500:5500 subdub-api
   ```

3. **Cloud Providers**:
   - AWS Elastic Beanstalk
   - Google App Engine
   - Heroku
   - DigitalOcean App Platform

### CI/CD Integration

- GitHub Actions or GitLab CI for continuous integration
- Automated tests before deployment
- Environment-specific deployment pipelines -->

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

<!-- ### Coding Standards

- Follow ESLint configuration
- Write comprehensive tests for new features
- Update documentation for API changes -->

<!-- ## License

This project is licensed under the MIT License - see the LICENSE file for details. -->

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [Upstash](https://upstash.com/)
- [Arcjet](https://arcjet.com/)
- [Nodemailer](https://nodemailer.com/)
