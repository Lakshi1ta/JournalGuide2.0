import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    value: String,
    emoji: String,
    label: String
  },
  content: {
    type: String,
    required: true
  },
  answers: {
    type: [String],
    default: []
  },
  mindset: {
    type: String,
    default: 'daily'
  },
  questions: {
    type: [{
      id: String,
      question: String,
      emoji: String,
      placeholder: String
    }],
    default: []
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Index for faster queries
journalEntrySchema.index({ user: 1, date: -1 });

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
export default JournalEntry;