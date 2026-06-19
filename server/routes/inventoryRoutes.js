import express from 'express';
import { 
    getInventory, 
    getMyInventory, 
    addInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem,
    getInventoryItemById,
    createProductReview,
    deleteProductReview
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getInventory)
    .post(protect, authorize('supplier', 'producer'), addInventoryItem);

router.route('/my')
    .get(protect, authorize('supplier', 'producer'), getMyInventory);

router.route('/:id')
    .get(protect, getInventoryItemById)
    .put(protect, authorize('supplier', 'producer'), updateInventoryItem)
    .delete(protect, authorize('supplier', 'producer', 'admin'), deleteInventoryItem);

router.route('/:id/reviews')
    .post(protect, createProductReview);

router.route('/:id/reviews/:reviewId')
    .delete(protect, deleteProductReview);

export default router;
