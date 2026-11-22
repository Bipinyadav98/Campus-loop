import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    college: user.college,
    course: user.course || '',
    semester: user.semester || null,
    verified: user.verified
  };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, college, course, semester } = req.body;
    if (!name?.trim() || !email?.trim() || !password || !college) {
      return res.status(400).json({ message: 'Name, email, password and college are required.' });
    }
    if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ message: 'This email is already registered. Please log in.' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: passwordHash,
      college,
      course: course?.trim() || '',
      semester: semester ? Number(semester) : undefined,
      verified: false
    });
    const token = jwt.sign(
      { id: user._id, role: user.role, college: user.college },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Could not create your account. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const user = email ? await User.findOne({ email }).populate('college', 'name shortName city') : null;
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role, college: user.college?._id || user.college },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: publicUser(user) });
  } catch {
    res.status(500).json({ message: 'Unable to log in right now.' });
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).populate('college', 'name shortName city');
  if (!user) return res.status(404).json({ message: 'Account not found.' });
  res.json(publicUser(user));
});

export default router;
