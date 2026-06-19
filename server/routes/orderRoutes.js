import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrders,
    getSupplierOrders,
    updateOrderStatus,
    getOrderById,
    checkProductPurchase
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('admin'), getOrders)
    .post(protect, createOrder);

router.get('/my', protect, getMyOrders);
router.get('/supplier', protect, authorize('supplier', 'producer'), getSupplierOrders);
router.get('/check-purchase/:productId', protect, checkProductPurchase);

router.route('/:id')
    .get(protect, getOrderById);

router.put('/:id/status', protect, updateOrderStatus);

export default router;
