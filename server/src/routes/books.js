import express from 'express';
import mongoose from 'mongoose';
import Book from '../models/Book.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { college, semester, course, subject, q, mode } = req.query;
    if (!college) return res.status(400).json({ message: 'Select a college to browse its books.' });
    const filter = { college, available: true };
    if (college) {
      if (!mongoose.isValidObjectId(college)) return res.status(400).json({ message: 'Invalid college.' });
      filter.college = college;
    }
    if (semester) filter.semester = Number(semester);
    if (course) filter.course = new RegExp(String(course).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (subject) filter.subject = new RegExp(String(subject).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (mode && ['rent', 'exchange'].includes(mode)) filter.mode = mode;
    if (q) {
      const safe = String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ title: new RegExp(safe, 'i') }, { author: new RegExp(safe, 'i') }, { subject: new RegExp(safe, 'i') }];
    }
    const books = await Book.find(filter)
      .populate('college', 'name shortName city')
      .populate('owner', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Could not load books.' });
  }
});

router.get('/mine', auth, async (req, res) => {
  const books = await Book.find({ owner: req.user.id })
    .populate('college', 'name shortName')
    .sort({ createdAt: -1 });
  res.json(books);
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, author, isbn, subject, course, semester, condition, mode, rentPerMonth, description } = req.body;
    if (!title?.trim() || !subject?.trim() || !course?.trim()) {
      return res.status(400).json({ message: 'Book title, subject and course are required.' });
    }
    const book = await Book.create({
      title: title.trim(),
      author: author?.trim() || '',
      isbn: isbn?.trim() || '',
      subject: subject.trim(),
      course: course.trim(),
      semester: Number(semester),
      condition: ['Like new', 'Good', 'Fair'].includes(condition) ? condition : 'Good',
      mode: mode === 'exchange' ? 'exchange' : 'rent',
      rentPerMonth: mode === 'exchange' ? 0 : Math.max(0, Number(rentPerMonth) || 0),
      description: description?.trim() || '',
      owner: req.user.id,
      college: req.user.college,
      available: true
    });
    await book.populate([{ path: 'college', select: 'name shortName city' }, { path: 'owner', select: 'name' }]);
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Could not publish this book.' });
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const allowed = ['title', 'author', 'subject', 'course', 'semester', 'condition', 'mode', 'rentPerMonth', 'description'];
    const update = {};
    for (const key of allowed) if (req.body[key] !== undefined) update[key] = req.body[key];
    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $set: update },
      { new: true, runValidators: true }
    ).populate('college', 'name shortName').populate('owner', 'name');
    if (!book) return res.status(404).json({ message: 'Book not found or you do not own it.' });
    res.json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
