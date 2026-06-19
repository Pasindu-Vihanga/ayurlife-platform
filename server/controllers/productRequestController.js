import ProductRequest from '../models/ProductRequest.js';
import Inventory from '../models/Inventory.js';

// @desc    Create a new product request
// @route   POST /api/requests
// @access  Private (Patient)
const createRequest = async (req, res) => {
    const { productName, details } = req.body;

    try {
        const request = new ProductRequest({
            patient: req.user._id,
            productName,
            details,
        });

        const createdRequest = await request.save();
        res.status(201).json(createdRequest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all product requests
// @route   GET /api/requests
// @access  Private (Producer, Supplier, Admin)
const getRequests = async (req, res) => {
    try {
        const requests = await ProductRequest.find({})
            .populate('patient', 'name')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get product requests for logged in patient
// @route   GET /api/requests/my
// @access  Private (Patient)
const getMyRequests = async (req, res) => {
    try {
        const requests = await ProductRequest.find({ patient: req.user._id })
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update product request status
// @route   PUT /api/requests/:id
// @access  Private (Producer, Supplier, Admin)
const updateRequestStatus = async (req, res) => {
    const { status, price, stock, image } = req.body;

    try {
        const request = await ProductRequest.findById(req.params.id);

        if (request) {
            request.status = status;
            const updatedRequest = await request.save();

            // Auto-create inventory item if status is Completed
            if (status === 'Completed') {
                const inventoryItem = new Inventory({
                    supplier: req.user._id,
                    name: request.productName,
                    scientificName: 'Custom Request Product',
                    category: 'Processed',
                    stock: stock || 10,
                    unit: 'Bottle',
                    pricePerUnit: price || 2500,
                    image: image || '/uploads/default-medicine.jpg'
                });
                await inventoryItem.save();
            }

            res.json(updatedRequest);
        } else {
            res.status(404).json({ message: 'Request not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export { createRequest, getRequests, getMyRequests, updateRequestStatus };
