# SubDub - Subscription Management API

SubDub is a robust subscription management system that helps users track, manage, and receive timely reminders for their recurring subscriptions.

## Features

- 📊 User dashboard with subscription analytics
- 📅 Automatic renewal tracking
- 📧 Email reminders for upcoming renewals
- 📱 Subscription management (add, update, cancel)
- 🔒 Secure authentication with JWT
- 👮 Role-based access control
- 🤖 Bot protection with Arcjet

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Email**: Nodemailer
- **Workflow Automation**: Upstash workflow
- **Security**: Helmet, CORS, Rate limiting

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Upstash account for workflow automation
- Gmail account for sending emails (or other email service)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/subdub.git
   cd subdub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create `.env.development.local` file with the following variables:
   ```
   # Server
   PORT=5000
   SERVER_URL=http://localhost:5000
   NODE_ENV=development
   
   # Database
   DB_URI=mongodb://localhost:27017/subscription-manager
   
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
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/v1/auth/sign-up` - Register a new user
- `POST /api/v1/auth/sign-in` - Login and get token
- `POST /api/v1/auth/sign-out` - Logout (client-side token removal)

### Users

- `GET /api/v1/users` - Get all users (admin only)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Subscriptions

- `GET /api/v1/subscriptions` - Get all subscriptions (admin only)
- `GET /api/v1/subscriptions/:id` - Get subscription by ID
- `POST /api/v1/subscriptions` - Create new subscription
- `PUT /api/v1/subscriptions/:id` - Update subscription
- `DELETE /api/v1/subscriptions/:id` - Delete subscription
- `GET /api/v1/subscriptions/user/:id` - Get user's subscriptions
- `PUT /api/v1/subscriptions/:id/cancel` - Cancel subscription
- `GET /api/v1/subscriptions/upcoming-renewals` - Get upcoming renewals

### Dashboard

- `GET /api/v1/dashboard` - Get user dashboard data
- `GET /api/v1/dashboard/admin` - Get admin dashboard (admin only)

## Project Structure

```
subscription-management/
├── config/                 # Configuration files
├── controllers/            # Request handlers
├── database/               # Database connection
├── middlewares/            # Express middlewares
├── models/                 # Mongoose models
├── routes/                 # API routes
├── utils/                  # Utility functions
├── validators/             # Input validation schemas
├── app.js                  # Express app
├── package.json            # Project dependencies
└── README.md               # Project documentation
```

## Data Models

### User Model

```javascript
{
  name: String,
  email: String,
  password: String,
  role: String,
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
  name: String,
  price: Number,
  currency: String,
  frequency: String,
  category: String,
  paymentMethod: String,
  status: String,
  startDate: Date,
  renewalDate: Date,
  user: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication and Security

This API uses JSON Web Tokens (JWT) for authentication. Include the token in the Authorization header for protected routes:

```
Authorization: Bearer your_jwt_token
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": 400
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [Upstash](https://upstash.com/)
- [Arcjet](https://arcjet.com/)