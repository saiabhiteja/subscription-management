import express from "express";
import { PORT } from "./config/env.js";
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import authRouter from "./routes/auth.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import workflowRouter from "./routes/workflow.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import logger from "./utils/logger.js";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet()); // Set security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Request parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Request logging
app.use(morgan('common', {
  stream: { write: message => logger.http(message.trim()) }
}));

// Bot protection
app.use(arcjetMiddleware);

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter);
app.use('/api/v1/dashboard', dashboardRouter);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success', 
    message: 'Welcome to SubDub API - Subscription Management Service',
    version: '1.0.0',
    documentation: '/api/v1/docs'
  });
});

// Serve documentation in development
if (process.env.NODE_ENV === 'development') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  app.use('/api/v1/docs', express.static(path.join(__dirname, 'docs')));
}

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server!`
  });
});

// Error handling middleware
app.use(errorMiddleware);

// Start server
app.listen(PORT, async () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  await connectToDatabase();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`UNHANDLED REJECTION: ${err.message}`);
  logger.error(err.stack);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION: ${err.message}`);
  logger.error(err.stack);
  // Close server & exit process
  process.exit(1);
});

export default app;