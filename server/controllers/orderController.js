import Order from '../models/Order.js';
import Inventory from '../models/Inventory.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    const { items, totalAmount, shippingAddress, city, postalCode, phoneNumber, paymentMethod, supplier } = req.body;

    if (items && items.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        // 1. Verify stock availability and collect updates
        const inventoryUpdates = [];
        for (const item of items) {
            if (item.inventoryItem) {
                const inventory = await Inventory.findById(item.inventoryItem);
                if (!inventory) {
                    return res.status(404).json({ message: `Herb ${item.name} not found in inventory` });
                }
                if (inventory.stock < item.quantity) {
                    return res.status(400).json({ message: `Insufficient stock for ${item.name}. Available: ${inventory.stock}` });
                }
                inventoryUpdates.push({ inventory, quantity: item.quantity });
            }
        }

        // 2. Create the order
        const order = new Order({
            buyer: req.user._id,
            supplier,
            items,
            shippingAddress,
            city,
            postalCode,
            phoneNumber,
            paymentMethod: paymentMethod || 'Cash on Delivery',
            totalAmount,
            status: 'pending'
        });

        const createdOrder = await order.save();

        // 3. Subtract stock and increment sales count
        for (const update of inventoryUpdates) {
            update.inventory.stock -= update.quantity;
            update.inventory.salesCount = (update.inventory.salesCount || 0) + update.quantity;
            await update.inventory.save();
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all orders (Admin/Staff)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('buyer', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get orders for a supplier
// @route   GET /api/orders/supplier
// @access  Private (Supplier)
const getSupplierOrders = async (req, res) => {
    try {
        const orders = await Order.find({ supplier: req.user._id })
            .populate('buyer', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin/Supplier)
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            // Check if user is admin, supplier, or the buyer
            const isAdmin = req.user.role === 'admin';
            const isSupplier = order.supplier && order.supplier.toString() === req.user._id.toString();
            const isBuyer = order.buyer && order.buyer.toString() === req.user._id.toString();

            if (!isAdmin && !isSupplier && !isBuyer) {
                return res.status(401).json({ message: 'Not authorized to update this order' });
            }

            // If user is ONLY the buyer, they can only set status to 'delivered'
            if (isBuyer && !isAdmin && !isSupplier) {
                if (req.body.status !== 'delivered') {
                    return res.status(403).json({ message: 'You can only confirm delivery' });
                }
            }

            order.status = req.body.status || order.status;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('buyer', 'name email')
            .populate('supplier', 'name email');

        if (order) {
            const isBuyer = order.buyer?._id.toString() === req.user._id.toString();
            const isSupplier = order.supplier?._id.toString() === req.user._id.toString();
            const isAdmin = req.user.role === 'admin';

            if (!isBuyer && !isSupplier && !isAdmin) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const checkProductPurchase = async (req, res) => {
    try {
        console.log(`Checking purchase for User: ${req.user._id}, Product: ${req.params.productId}`);
        
        const order = await Order.findOne({
            buyer: req.user._id,
            'items.inventoryItem': req.params.productId,
            status: { $ne: 'cancelled' }
        });

        if (order) {
            console.log(`Found matching order: ${order._id} with status ${order.status}`);
        } else {
            console.log(`No matching order found for product ${req.params.productId}`);
        }

        res.json({ hasPurchased: !!order });
    } catch (error) {
        console.error('Check Purchase Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export {
    createOrder,
    getMyOrders,
    getOrders,
    getSupplierOrders,
    updateOrderStatus,
    getOrderById,
    checkProductPurchase
};
