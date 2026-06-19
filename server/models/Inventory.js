import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    scientificName: String,
    category: {
        type: String,
        enum: ['Raw Herb', 'Dried Root', 'Seed', 'Oil Extract', 'Flower', 'Processed', 'Oil', 'Capsule', 'Arishta', 'Powder', 'Pill', 'Paste', 'Other'],
        default: 'Raw Herb'
    },
    description: String,
    image: String, // URL or path
    stock: {
        type: Number,
        default: 0
    },
    unit: {
        type: String,
        default: 'kg'
    },
    pricePerUnit: Number,
    expiryDate: Date,
    rating: {
        type: Number,
        default: 4.5 // Default high rating for natural products
    },
    numReviews: {
        type: Number,
        default: 0
    },
    estimatedDelivery: {
        type: String,
        default: '2-4 Business Days'
    },
    salesCount: {
        type: Number,
        default: 0
    },
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch'
    },
    reviews: {
        type: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
                name: { type: String, required: true },
                rating: { type: Number, required: true },
                comment: { type: String, required: true },
                createdAt: { type: Date, default: Date.now }
            }
        ],
        default: []
    }
}, {
    timestamps: true
});

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
