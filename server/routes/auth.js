import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    const password = (req.body.password || '').trim();

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // find the user by email
    const user = await User.findOne({ email });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // compare entered password with stored hash
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // sign JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      role: user.role,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
