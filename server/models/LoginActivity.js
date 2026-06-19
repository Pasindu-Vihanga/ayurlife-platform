import mongoose from 'mongoose';

const loginActivitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        default: 'Unknown'
    },
    deviceInfo: {
        type: String,
        default: 'Mobile App'
    },
    loginTime: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['success', 'failed'],
        default: 'success'
    }
}, {
    timestamps: true
});

const LoginActivity = mongoose.model('LoginActivity', loginActivitySchema);
export default LoginActivity;
