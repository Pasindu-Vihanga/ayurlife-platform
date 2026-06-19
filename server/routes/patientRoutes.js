import express from 'express';
import { getPatientProfile, updatePatientProfile, addSymptomLog, deleteSymptomLog } from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes here are protected and allow any authenticated user to track their own symptoms
router.route('/me')
    .get(protect, getPatientProfile);

router.route('/')
    .post(protect, updatePatientProfile);

router.route('/symptoms')
    .post(protect, addSymptomLog);

router.route('/symptoms/:index')
    .delete(protect, deleteSymptomLog);

export default router;
