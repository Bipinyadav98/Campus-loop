import express from 'express';
import College from '../models/College.js';
const router = express.Router();
router.get('/', async (_req, res) => res.json(await College.find({ active: true }).sort({ name: 1 })));
export default router;
