import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboardController';

const router = Router();

router.get('/:challengeId', getLeaderboard);

export default router;
