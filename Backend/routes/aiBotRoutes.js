import express from 'express';
import { chatWithBot, getWelcomeMessage } from '../controller/aiBotController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/chat', chatWithBot);
router.get('/welcome', getWelcomeMessage);

export default router;