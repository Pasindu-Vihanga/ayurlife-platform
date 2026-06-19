import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'supplier', 'producer', 'wellness_staff', 'admin'],
        default: 'patient'
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'rejected'],
        default: 'active' // Doctors/Suppliers might need approval
    },
    profileDetails: {
        type: mongoose.Schema.Types.Mixed, // Flexibility for different roles
        default: {}
    },
    // Heritage/Producer Fields
    heritageStory: String,
    experienceYears: Number,
    isCertified: { type: Boolean, default: false }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
