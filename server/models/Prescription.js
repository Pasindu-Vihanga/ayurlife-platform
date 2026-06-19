import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    medicines: [{
        name: String,
        type: { type: String }, // Decoction, Pill, Oil
        dosage: String, // 1 tsp
        frequency: String, // morning/night
        days: Number
    }],
    instructions: String,
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
