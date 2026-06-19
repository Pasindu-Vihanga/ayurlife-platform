import mongoose from 'mongoose';

const productRequestSchema = mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    productName: {
        type: String,
        required: true
    },
    details: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Pending', 'In Review', 'Approved', 'Completed', 'Rejected'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ProductRequest = mongoose.model('ProductRequest', productRequestSchema);

export default ProductRequest;
