import express from 'express';
import {
    getFormulations,
    createFormulation,
    getBatches,
    createBatch,
    updateBatch,
    getMyFormulations,
    getMyBatches,
    deleteBatch,
    deleteFormulation,
    getBatchById,
    releaseToInventory,
    getProducerProfile,
    updateProducerProfile
} from '../controllers/productionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/formulas')
    .get(protect, getFormulations)
    .post(protect, authorize('producer'), createFormulation);

router.route('/formulas/:id')
    .delete(protect, authorize('producer'), deleteFormulation);

router.get('/my-formulas', protect, authorize('producer'), getMyFormulations);

router.route('/batches')
    .get(protect, getBatches)
    .post(protect, authorize('producer'), createBatch);

router.get('/my-batches', protect, authorize('producer'), getMyBatches);

router.route('/batches/:id')
    .get(protect, getBatchById)
    .put(protect, authorize('producer'), updateBatch)
    .delete(protect, authorize('producer'), deleteBatch);

router.post('/batches/:id/release', protect, authorize('producer'), releaseToInventory);

router.get('/profile/:id', getProducerProfile);
router.put('/profile', protect, authorize('producer'), updateProducerProfile);

export default router;
