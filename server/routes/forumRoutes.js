import express from 'express';
import { 
    getForumQuestions, 
    createQuestion, 
    addAnswer, 
    updateForumStatus,
    deleteQuestion,
    deleteAnswer
} from '../controllers/forumController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getForumQuestions)
    .post(protect, createQuestion);

router.post('/:id/answer', protect, addAnswer);

router.put('/:id/status', protect, authorize('admin'), updateForumStatus);
router.delete('/:id', protect, authorize('admin'), deleteQuestion);
router.delete('/:id/answer/:answerId', protect, authorize('admin'), deleteAnswer);

export default router;
