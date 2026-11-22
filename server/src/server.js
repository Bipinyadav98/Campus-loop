import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import requestRoutes from './routes/requests.js';
import collegeRoutes from './routes/colleges.js';

const app = express();
const allowedOrigins = [...new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  ...(process.env.CLIENT_URL || '').split(',').map(value => value.trim()).filter(Boolean)
])];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CampusLoop CORS policy.'));
  }
}));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'CampusLoop API' }));
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/colleges', collegeRoutes);

app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ message: 'Unexpected server error.' });
});

const port = process.env.PORT || 4000;
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing from server/.env');
  process.exit(1);
}
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusloop')
  .then(() => app.listen(port, () => console.log(`CampusLoop API running on ${port}`)))
  .catch((err) => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
