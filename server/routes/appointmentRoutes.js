import express from 'express';
import { bookAppointment, getMyAppointments, getDoctorAppointments, updateAppointmentStatus, getBookedSlots } from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('patient'), bookAppointment);

router.route('/my')
    .get(protect, authorize('patient'), getMyAppointments);

router.route('/doctor')
    .get(protect, authorize('doctor'), getDoctorAppointments);

router.route('/doctor/:id/booked-slots')
    .get(protect, getBookedSlots);

router.route('/:id/status')
    .put(protect, authorize('doctor'), updateAppointmentStatus);

export default router;
