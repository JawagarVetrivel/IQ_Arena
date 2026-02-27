import { Router } from 'express';
import { startQuiz, submitTest, getResult } from '../controllers/quizController';

const router = Router();

router.post('/start-quiz', startQuiz);
router.post('/submit-test', submitTest);
router.get('/result/:challengeId/:userName', getResult);

export default router;
