import express from 'express';
import { 
    getKnowledgeArticles, 
    createKnowledgeArticle, 
    getMyKnowledgeArticles, 
    publishKnowledgeArticle, 
    getAllKnowledgeArticlesForAdmin, 
    deleteKnowledgeArticle,
    likeKnowledgeArticle,
    shareKnowledgeArticle,
    getKnowledgeArticleById
} from '../controllers/knowledgeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getKnowledgeArticles)
    .post(protect, createKnowledgeArticle);

router.get('/all', protect, authorize('admin'), getAllKnowledgeArticlesForAdmin);
router.get('/my', protect, getMyKnowledgeArticles);
router.get('/:id', getKnowledgeArticleById);
router.put('/:id/publish', protect, authorize('admin'), publishKnowledgeArticle);
router.put('/:id/like', protect, likeKnowledgeArticle);
router.put('/:id/share', shareKnowledgeArticle);
router.delete('/:id', protect, deleteKnowledgeArticle);

export default router;
