import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for patient purchases
    items: [{
        inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
        name: String,
        image: String,
        quantity: Number,
        price: Number
    }],
    shippingAddress: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    paymentMethod: { type: String, default: 'Cash on Delivery' },
    totalAmount: Number,
    status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    orderDate: { type: Date, default: Date.now }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
