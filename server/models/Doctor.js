import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    specialization: {
        type: String,
        default: 'Ayurveda General'
    },
    licenseNumber: {
        type: String,
        required: true
    },
    licenseDocument: {
        type: String,  // URL to uploaded license image
        default: null
    },
    experienceYears: Number,
    hospitalAffiliation: String,
    availability: [{
        day: String, // Mon, Tue, etc.
        startTime: String, // 09:00
        endTime: String // 17:00
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    verifiedAt: {
        type: Date
    }
}, {
    timestamps: true
});

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
