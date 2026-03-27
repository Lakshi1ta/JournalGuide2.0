import express from 'express';
import { generateJournalEntry, testGeminiConnection } from '../controller/geminiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes - user must be logged in
router.use(protect);

// Test route
router.get('/test', testGeminiConnection);

// Generate journal entry
router.post('/generate', generateJournalEntry);

export default router;