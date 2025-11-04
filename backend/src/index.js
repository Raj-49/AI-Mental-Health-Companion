import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Router } from 'express';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check route
app.get('/', (req, res) => {
  res.send('API is running smoothly')  ;
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize placeholder routers
const authRouter = Router();
const chatRouter = Router();

// Mount routers
app.use('/auth', authRouter);
app.use('/chat', chatRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});