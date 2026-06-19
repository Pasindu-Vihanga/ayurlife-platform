import express from 'express';
import { createPrescription, getPrescriptionById, getMyPrescriptions, getPrescriptionsByPatient } from '../controllers/prescriptionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('doctor'), createPrescription);

router.route('/my')
    .get(protect, getMyPrescriptions);

router.route('/patient/:patientId')
    .get(protect, authorize('doctor', 'admin'), getPrescriptionsByPatient);

router.route('/:id')
    .get(protect, getPrescriptionById);

export default router;
