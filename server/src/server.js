import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import requestRoutes from './routes/requests.js';
import collegeRoutes from './routes/colleges.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'CampusLoop API' }));
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/colleges', collegeRoutes);

const port = process.env.PORT || 4000;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusloop')
  .then(() => app.listen(port, () => console.log(`CampusLoop API running on ${port}`)))
  .catch((err) => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
