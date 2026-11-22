import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: String,
  isbn: String,
  subject: String,
  course: String,
  semester: Number,
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  condition: { type: String, enum: ['Like new', 'Good', 'Fair'], default: 'Good' },
  mode: { type: String, enum: ['rent', 'exchange'], default: 'rent' },
  rentPerMonth: { type: Number, default: 0 },
  available: { type: Boolean, default: true },
  image: String,
  description: String
}, { timestamps: true });

export default mongoose.model('Book', bookSchema);
