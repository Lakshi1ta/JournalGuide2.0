import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// FIRST: Load environment variables
import './config/loadEnv.js';

console.log('🔍 SERVER CHECK:');
console.log('- GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('- GEMINI_API_KEY prefix:', process.env.GEMINI_API_KEY?.substring(0, 15) + '...');
console.log('- MONGO_URI exists:', !!process.env.MONGO_URI);

// THEN: Import routes (after env is loaded)
import aiBotRoutes from './routes/aiBotRoutes.js';
import authRoutes from './routes/authRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import geminiRoutes from './routes/geminiRoutes.js';

const app = express();

// CORS configuration
app.use(cors({
  origin: ['https://journalguide3-0.onrender.com'],

  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Error:', err.message);
  process.exit(1);
});
// Add this import

// Add this route
app.use('/api/aibot', aiBotRoutes);
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/gemini', geminiRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Journal Guide API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});