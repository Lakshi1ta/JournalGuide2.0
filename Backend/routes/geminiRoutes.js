import express from 'express';
import { generateJournalEntry, testGeminiConnection } from '../controller/geminiController.js';  // Changed from 'controllers' to 'controller'
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/test', testGeminiConnection);
router.post('/generate', generateJournalEntry);

export default router;