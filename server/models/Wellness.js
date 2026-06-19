import mongoose from 'mongoose';

const therapySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    durationMinutes: Number,
    price: Number,
    image: { type: String, default: '' },
    category: { type: String, default: 'General' },
    requiredRooms: [{ type: String }], // e.g., ["Steam Room", "Massage Table"]
    careInstructions: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Therapy = mongoose.model('Therapy', therapySchema);

const bookingSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    therapy: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapy', required: true },
    date: Date,
    time: String,
    therapist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Staff member
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentMethod: { type: String },
    amount: { type: Number },
    roomNumber: { type: String },
    assignedTherapistName: { type: String },
    notes: { type: String }
}, { timestamps: true });

export const Booking = mongoose.model('Booking', bookingSchema);
