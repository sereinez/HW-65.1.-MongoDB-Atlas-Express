import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    content: { type: String, required: true, maxlength: 20_000 },
    // Посилання на автора (колекція users); populate('author') підставляє документ автора.
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

// Колекція в MongoDB: "articles"
export default mongoose.model('Article', articleSchema);
