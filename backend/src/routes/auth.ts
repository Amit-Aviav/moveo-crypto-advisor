import { Router } from 'express';
import { signup, login } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);

// Protected route to verify token
router.get('/me', requireAuth, (req, res) => {
  // middleware sets req.user
  // @ts-ignore
  res.json({ ok: true, user: req.user });
});

export default router;
