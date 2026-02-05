import express, { type Router } from 'ultimate-express';

import { authenticateToken } from '../../middleware/index.js';
import { llmChatClient } from '../controllers/llmChat.js';

// /api/llm
const router: Router = express.Router();

router.post("/chat", authenticateToken, llmChatClient);

export default router;