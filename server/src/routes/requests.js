import express from 'express';
import Request from '../models/Request.js';
import Book from '../models/Book.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/mine', auth, async (req, res) => {
  const requests = await Request.find({ $or: [{ requester: req.user.id }, { owner: req.user.id }] })
    .populate('book', 'title subject semester rentPerMonth').populate('requester', 'name').populate('owner', 'name').sort({ createdAt: -1 });
  res.json(requests);
});

router.post('/', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.body.book);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (String(book.college) !== String(req.user.college)) return res.status(403).json({ message: 'Cross-college requests are not allowed' });
    if (String(book.owner) === String(req.user.id)) return res.status(400).json({ message: 'You cannot request your own book' });
    const request = await Request.create({ book: book._id, requester: req.user.id, owner: book.owner, type: req.body.type || book.mode, note: req.body.note, dueDate: req.body.dueDate });
    res.status(201).json(request);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.patch('/:id/status', auth, async (req, res) => {
  const request = await Request.findOne({ _id: req.params.id, owner: req.user.id });
  if (!request) return res.status(404).json({ message: 'Request not found' });
  request.status = req.body.status;
  await request.save();
  if (request.status === 'approved') await Book.findByIdAndUpdate(request.book, { available: false });
  if (request.status === 'returned') await Book.findByIdAndUpdate(request.book, { available: true });
  res.json(request);
});

export default router;
