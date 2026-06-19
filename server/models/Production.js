import mongoose from 'mongoose';

const formulationSchema = new mongoose.Schema({
    producer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['Oil', 'Powder', 'Arishta', 'Pill', 'Paste'], required: true },
    ingredients: [{
        name: String,
        quantity: String
    }],
    method: String,
    productionTimeDays: Number
}, { timestamps: true });

export const Formulation = mongoose.model('Formulation', formulationSchema);

const batchSchema = new mongoose.Schema({
    formulation: { type: mongoose.Schema.Types.ObjectId, ref: 'Formulation', required: true },
    batchNumber: { type: String, required: true, unique: true },
    quantityProduced: Number,
    startDate: Date,
    status: { type: String, enum: ['fermenting', 'processing', 'in-review', 'packaging', 'ready', 'bottled', 'expired'], default: 'processing' },
    expiryDate: Date,
    labReport: String, // URL to image/document
    qualityLogs: [{
        date: { type: Date, default: Date.now },
        note: String, // Color, taste, etc.
        checkedBy: String
    }]
}, { timestamps: true });

export const Batch = mongoose.model('Batch', batchSchema);
