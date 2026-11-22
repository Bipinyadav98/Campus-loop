import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  course: String,
  semester: Number,
  verified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
