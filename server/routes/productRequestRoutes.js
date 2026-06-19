import express from 'express';
import { createRequest, getRequests, getMyRequests, updateRequestStatus } from '../controllers/productRequestController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createRequest)
    .get(protect, authorize('producer', 'supplier', 'admin'), getRequests);

router.get('/my', protect, getMyRequests);

router.route('/:id')
    .put(protect, authorize('producer', 'supplier', 'admin'), updateRequestStatus);

export default router;
