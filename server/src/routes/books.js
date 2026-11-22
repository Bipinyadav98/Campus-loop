import express from 'express';
import Book from '../models/Book.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { college, semester, course, subject, q, mode } = req.query;
    const filter = { available: true };
    if (college) filter.college = college;
    if (semester) filter.semester = Number(semester);
    if (course) filter.course = course;
    if (subject) filter.subject = subject;
    if (mode) filter.mode = mode;
    if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { author: new RegExp(q, 'i') }, { subject: new RegExp(q, 'i') }];
    const books = await Book.find(filter).populate('college', 'name shortName').populate('owner', 'name').sort({ createdAt: -1 });
    res.json(books);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const book = await Book.create({ ...req.body, owner: req.user.id, college: req.user.college });
    res.status(201).json(book);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.patch('/:id', auth, async (req, res) => {
  const book = await Book.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, req.body, { new: true });
  if (!book) return res.status(404).json({ message: 'Book not found or not owned by you' });
  res.json(book);
});

export default router;
