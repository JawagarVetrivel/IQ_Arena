import { Router } from 'express';
import { startQuiz, submitTest } from '../controllers/quizController';

const router = Router();

router.post('/start-quiz', startQuiz);
router.post('/submit-test', submitTest);

export default router;
