import express from 'express';
import mongoose from 'mongoose';
import Request from '../models/Request.js';
import Book from '../models/Book.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/mine', auth, async (req, res) => {
  try {
    const requests = await Request.find({
      $or: [{ requester: req.user.id }, { owner: req.user.id }]
    })
      .populate({ path: 'book', select: 'title subject semester rentPerMonth mode available' })
      .populate({ path: 'requester', select: 'name email' })
      .populate({ path: 'owner', select: 'name email' })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch {
    res.status(500).json({ message: 'Could not load your requests.' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.body.book)) return res.status(400).json({ message: 'Choose a valid book.' });
    const book = await Book.findById(req.body.book);
    if (!book) return res.status(404).json({ message: 'Book not found.' });
    if (!book.available) return res.status(409).json({ message: 'This book is currently on loan.' });
    if (String(book.college) !== String(req.user.college)) {
      return res.status(403).json({ message: 'Requests are limited to your own college.' });
    }
    if (String(book.owner) === String(req.user.id)) return res.status(400).json({ message: 'You cannot request your own book.' });
    const existing = await Request.findOne({ book: book._id, requester: req.user.id, status: { $in: ['pending', 'approved'] } });
    if (existing) return res.status(409).json({ message: 'You already have an active request for this book.' });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const request = await Request.create({
      book: book._id,
      requester: req.user.id,
      owner: book.owner,
      type: book.mode,
      status: 'pending',
      pickupPoint: req.body.pickupPoint?.trim() || 'Campus Library Desk',
      note: req.body.note?.trim() || '',
      dueDate
    });
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Could not send request.' });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'returned'].includes(status)) {
      return res.status(400).json({ message: 'Choose a valid request status.' });
    }
    const request = await Request.findOne({ _id: req.params.id, owner: req.user.id });
    if (!request) return res.status(404).json({ message: 'Request not found or you are not the book owner.' });
    if (status === 'approved') {
      if (request.status !== 'pending') return res.status(409).json({ message: 'Only pending requests can be approved.' });
      const book = await Book.findById(request.book);
      if (!book || !book.available) return res.status(409).json({ message: 'This book is no longer available.' });
      const alreadyApproved = await Request.findOne({ book: request.book, status: 'approved', _id: { $ne: request._id } });
      if (alreadyApproved) return res.status(409).json({ message: 'Another request already has this book.' });
      book.available = false;
      await book.save();
    } else if (status === 'returned') {
      if (request.status !== 'approved') return res.status(409).json({ message: 'Only an approved rental can be marked returned.' });
      await Book.findByIdAndUpdate(request.book, { available: true });
    } else if (request.status !== 'pending') {
      return res.status(409).json({ message: 'Only pending requests can be rejected.' });
    }
    request.status = status;
    await request.save();
    await request.populate([
      { path: 'book', select: 'title subject semester rentPerMonth mode available' },
      { path: 'requester', select: 'name email' },
      { path: 'owner', select: 'name email' }
    ]);
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Could not update request status.' });
  }
});

export default router;
