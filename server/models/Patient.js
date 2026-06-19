import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    prakruthi: {
        type: String,
        enum: ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha', 'Tridosha', 'Unknown'],
        default: 'Unknown'
    },
    history: [{
        treatment: String,
        doctor: String,
        date: Date,
        notes: String
    }],
    symptoms: [{
        symptomName: String,
        severity: String,
        duration: String,
        notes: String,
        date: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
