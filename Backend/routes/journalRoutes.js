import express from 'express';
import { 
  createJournalEntry, 
  getJournalEntries,
  getJournalStats,
  deleteJournalEntry
} from '../controller/journalController.js';  // Changed from 'controllers' to 'controller'
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getJournalStats);
router.route('/')
  .get(getJournalEntries)
  .post(createJournalEntry);

router.delete('/:id', deleteJournalEntry);

export default router;