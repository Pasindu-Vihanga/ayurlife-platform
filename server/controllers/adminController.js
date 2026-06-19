import User from '../models/User.js';
import SiteSettings from '../models/SiteSettings.js';
import LoginActivity from '../models/LoginActivity.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user verification status
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin)
// Note: In our current schema we don't strictly have a 'verified' boolean separate from role, 
// but we can simulate it or add it. Let's assume we might want to approve doctors.
// For now, let's allow editing roles or deleting users.
const updateUserStatus = async (req, res) => {
    const { role } = req.body;

    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.role = role || user.role;
            // user.isVerified = true; // If we had this

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get site settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
const getSettings = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = await SiteSettings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update site settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
const updateSettings = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = new SiteSettings(req.body);
        } else {
            Object.assign(settings, req.body);
        }
        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

import Doctor from '../models/Doctor.js';

// ... existing functions ...

// @desc    Get all pending doctors
// @route   GET /api/admin/doctors/pending
// @access  Private (Admin)
const getPendingDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ verificationStatus: 'pending' }).populate('user', 'name email');
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Verify a doctor
// @route   PUT /api/admin/doctors/:id/verify
// @access  Private (Admin)
const verifyDoctor = async (req, res) => {
    const { status } = req.body; // 'approved' or 'rejected'

    try {
        const doctor = await Doctor.findById(req.params.id);

        if (doctor) {
            doctor.verificationStatus = status;
            doctor.isVerified = status === 'approved';
            doctor.verifiedAt = status === 'approved' ? Date.now() : null;

            await doctor.save();
            res.json(doctor);
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get doctor login activity logs
// @route   GET /api/admin/doctor-logins
// @access  Private (Admin)
const getDoctorLoginActivity = async (req, res) => {
    try {
        const logs = await LoginActivity.find({ role: 'doctor' })
            .populate('user', 'name email')
            .sort({ loginTime: -1 })
            .limit(100); // Last 100 login events
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { getUsers, updateUserStatus, deleteUser, getSettings, updateSettings, getPendingDoctors, verifyDoctor, getDoctorLoginActivity };
