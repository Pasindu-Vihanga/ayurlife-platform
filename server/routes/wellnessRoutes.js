import express from 'express';
import { getTherapies, createTherapy, updateTherapy, deleteTherapy, bookTherapy, getBookings, updateBookingStatus, getMyWellnessBookings, checkBookedSlots } from '../controllers/wellnessController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getTherapies);

router.route('/therapies')
    .get(protect, getTherapies)
    .post(protect, authorize('wellness_staff', 'admin'), createTherapy);

router.route('/therapies/:id')
    .put(protect, authorize('wellness_staff', 'admin'), updateTherapy)
    .delete(protect, authorize('wellness_staff', 'admin'), deleteTherapy);

router.route('/bookings')
    .post(protect, authorize('patient'), bookTherapy)
    .get(protect, authorize('wellness_staff', 'admin'), getBookings);

router.route('/my-bookings')
    .get(protect, authorize('patient', 'wellness_staff'), getMyWellnessBookings);

router.route('/bookings/:id')
    .put(protect, authorize('wellness_staff', 'admin'), updateBookingStatus);

router.get('/slots', protect, checkBookedSlots);

export default router;
