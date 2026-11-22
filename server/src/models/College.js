import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  shortName: { type: String, required: true, trim: true },
  city: String,
  domain: String,
  verified: { type: Boolean, default: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('College', collegeSchema);
