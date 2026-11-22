import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['rent', 'exchange'], default: 'rent' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'returned'], default: 'pending' },
  pickupPoint: { type: String, default: 'Campus Library Desk' },
  note: String,
  dueDate: Date
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);
