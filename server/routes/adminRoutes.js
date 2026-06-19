import express from 'express';
import { getUsers, updateUserStatus, deleteUser, getSettings, updateSettings, getPendingDoctors, verifyDoctor, getDoctorLoginActivity } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require Admin role
router.use(protect);
router.use(authorize('admin'));

router.route('/users')
    .get(getUsers);

router.route('/users/:id')
    .delete(deleteUser);

router.route('/users/:id/verify')
    .put(updateUserStatus);

router.route('/doctors/pending')
    .get(getPendingDoctors);

router.route('/doctors/:id/verify')
    .put(verifyDoctor);

router.route('/doctor-logins')
    .get(getDoctorLoginActivity);

router.route('/settings')
    .get(getSettings)
    .put(updateSettings);

export default router;
