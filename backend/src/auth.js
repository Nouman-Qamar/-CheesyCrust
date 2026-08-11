const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('./models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'cheesycrust_fallback_secret';
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';

// Make sure a default admin account exists (first run / fresh DB)
async function ensureDefaultAdmin() {
  try {
    const existing = await User.countDocuments();
    if (existing === 0) {
      const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      await User.create({ username: DEFAULT_USERNAME, password: hash, role: 'admin' });
      console.log('✅ Default admin user created (admin / admin123)');
    }
  } catch (err) {
    console.error('Failed to seed default admin:', err.message);
  }
}

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    await ensureDefaultAdmin();

    const user = await User.findOne({ username: username.trim(), is_active: true });
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid username or password' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// PUT /api/auth/change-password — requires current password, must be logged in
router.put('/auth/change-password', requireAuth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'current_password and new_password are required' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(current_password, user.password);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect' });

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('change-password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/auth/change-username — requires current password, must be logged in
router.put('/auth/change-username', requireAuth, async (req, res) => {
  try {
    const { current_password, new_username } = req.body;
    if (!current_password || !new_username) {
      return res.status(400).json({ error: 'current_password and new_username are required' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(current_password, user.password);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect' });

    const taken = await User.findOne({ username: new_username.trim(), _id: { $ne: user._id } });
    if (taken) return res.status(400).json({ error: 'Username already taken' });

    user.username = new_username.trim();
    await user.save();
    res.json({ message: 'Username changed successfully', user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    console.error('change-username error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = { router, requireAuth, ensureDefaultAdmin };
