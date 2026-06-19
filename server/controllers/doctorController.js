import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
    try {
        // Find all doctor profiles with populated user info
        const doctorProfiles = await Doctor.find({}).populate('user', 'name email role');

        // Also find users with role doctor who may not have a profile yet
        const users = await User.find({ role: 'doctor' }).select('name email role');

        // Build final list: start with profile-based entries
        const profileUserIds = doctorProfiles.map(p => p.user?._id?.toString());
        const usersWithoutProfile = users.filter(u => !profileUserIds.includes(u._id.toString()));

        const fromProfiles = doctorProfiles.map(profile => ({
            _id: profile._id,
            user: profile.user,
            specialization: profile.specialization || 'Ayurveda General',
            experienceYears: profile.experienceYears || 0,
            licenseNumber: profile.licenseNumber || 'Pending',
            hospitalAffiliation: profile.hospitalAffiliation || null,
            isVerified: profile.isVerified,
            verificationStatus: profile.verificationStatus || 'pending',
            verifiedAt: profile.verifiedAt || null,
            licenseDocument: profile.licenseDocument || null,
            availability: profile.availability || [],
        }));

        const fromUsers = usersWithoutProfile.map(user => ({
            _id: `virtual-${user._id}`,
            user: user,
            specialization: 'Ayurveda General',
            experienceYears: 0,
            licenseNumber: 'Pending',
            hospitalAffiliation: null,
            isVerified: false,
            verificationStatus: 'pending',
            verifiedAt: null,
            licenseDocument: null,
            availability: [],
        }));

        res.json([...fromProfiles, ...fromUsers]);
    } catch (error) {
        console.error('Error in getDoctors:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create/Update doctor profile
// @route   POST /api/doctors
// @access  Private (Doctor)
const updateDoctorProfile = async (req, res) => {
    const { specialization, licenseNumber, experienceYears, hospitalAffiliation, availability, licenseDocument } = req.body;

    try {
        let doctor = await Doctor.findOne({ user: req.user._id });

        if (doctor) {
            doctor.specialization = specialization || doctor.specialization;
            doctor.licenseNumber = licenseNumber || doctor.licenseNumber;
            doctor.experienceYears = experienceYears || doctor.experienceYears;
            doctor.hospitalAffiliation = hospitalAffiliation || doctor.hospitalAffiliation;
            doctor.availability = availability || doctor.availability;
            if (licenseDocument) doctor.licenseDocument = licenseDocument;

            const updatedDoctor = await doctor.save();
            res.json(updatedDoctor);
        } else {
            doctor = new Doctor({
                user: req.user._id,
                specialization,
                licenseNumber: licenseNumber || 'PENDING',
                experienceYears,
                hospitalAffiliation,
                availability,
                licenseDocument: licenseDocument || null,
            });
            const createdDoctor = await doctor.save();
            res.status(201).json(createdDoctor);
        }
    } catch (error) {
        console.error('updateDoctorProfile error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export { getDoctors, updateDoctorProfile };
