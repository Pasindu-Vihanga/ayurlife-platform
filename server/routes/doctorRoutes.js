import express from 'express';
import { getDoctors, updateDoctorProfile } from '../controllers/doctorController.js';
import { getPatients, getPatientById } from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getDoctors)
    .post(protect, authorize('doctor'), updateDoctorProfile);

router.route('/patients')
    .get(protect, authorize('doctor'), getPatients);

router.route('/patients/:id')
    .get(protect, authorize('doctor'), getPatientById);

export default router;
