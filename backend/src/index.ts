import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './utils/prisma'; 

// Load environment variables
dotenv.config();

// Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Echo (POST)
app.post('/echo', (req, res) => {
  res.json({ message: 'I got your data!', data: req.body });
});

// DB test (GET)
app.get('/db-test', async (_req, res) => {
  try {
    const users = await prisma.user.count(); // simpler: just count
    res.json({ ok: true, userCount: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Database connection failed' });
  }
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    app: 'Moveo Crypto Advisor API',
    status: 'ok',
    routes: ['/health', '/db-test', 'POST /echo']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
