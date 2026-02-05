import express from 'ultimate-express';
import type { Router } from 'ultimate-express';

import { authenticateToken } from '../../middleware/index.js';
import { startStream, joinStream } from '../controllers/liveStream.js';

// /api/live
const router: Router = express.Router();

//Check for users subscription if the streamer has a subscribers only stream
router.post("/start", authenticateToken, startStream);
router.post("/join/:streamId", authenticateToken, joinStream);

export default router;