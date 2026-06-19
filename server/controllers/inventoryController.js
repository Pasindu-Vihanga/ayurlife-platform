import Inventory from '../models/Inventory.js';
import Order from '../models/Order.js';

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Public (or Private?) - Let's make it private for Doctors/Producers/Suppliers
const getInventory = async (req, res) => {
    try {
        const items = await Inventory.find({}).populate('supplier', 'name email');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get supplier's own inventory
// @route   GET /api/inventory/my
// @access  Private (Supplier)
const getMyInventory = async (req, res) => {
    try {
        const items = await Inventory.find({ supplier: req.user._id });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add inventory item
// @route   POST /api/inventory
// @access  Private (Supplier)
const addInventoryItem = async (req, res) => {
    const { name, scientificName, category, stock, unit, pricePerUnit, expiryDate, image, description } = req.body;

    try {
        const item = new Inventory({
            supplier: req.user._id,
            name,
            scientificName,
            category,
            stock,
            unit,
            pricePerUnit,
            expiryDate,
            image,
            description
        });

        const createdItem = await item.save();
        res.status(201).json(createdItem);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update inventory item (stock/price)
// @route   PUT /api/inventory/:id
// @access  Private (Supplier)
const updateInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);

        if (item) {
            if (item.supplier.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            item.name = req.body.name || item.name;
            item.scientificName = req.body.scientificName || item.scientificName;
            item.category = req.body.category || item.category;
            item.stock = req.body.stock !== undefined ? req.body.stock : item.stock;
            item.unit = req.body.unit || item.unit;
            item.pricePerUnit = req.body.pricePerUnit !== undefined ? req.body.pricePerUnit : item.pricePerUnit;
            item.expiryDate = req.body.expiryDate || item.expiryDate;
            item.image = req.body.image || item.image;
            item.description = req.body.description || item.description;

            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Supplier)
const deleteInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);

        if (item) {
            if (req.user.role !== 'admin' && item.supplier.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            await item.deleteOne();
            res.json({ message: 'Item removed' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Public
const getInventoryItemById = async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id).populate('supplier', 'name email');
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const createProductReview = async (req, res) => {
    const { rating, comment } = req.body;
    console.log(`Review Request received for product: ${req.params.id}`);
    console.log(`Review Data: rating=${rating}, comment=${comment}`);

    try {
        const product = await Inventory.findById(req.params.id);

        if (product) {
            // Check if user has purchased the product (Admins exempt)
            if (req.user.role !== 'admin') {
                const hasPurchased = await Order.findOne({
                    buyer: req.user._id,
                    'items.inventoryItem': req.params.id,
                    status: { $ne: 'cancelled' }
                });

                if (!hasPurchased) {
                    return res.status(403).json({ message: 'You must purchase this product before writing a review' });
                }
            }

            // Ensure reviews array exists
            if (!product.reviews) {
                product.reviews = [];
            }

            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'You have already reviewed this product' });
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
                createdAt: new Date()
            };

            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            
            // Calculate new rating
            const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
            product.rating = totalRating / product.reviews.length;

            product.markModified('reviews');
            await product.save();
            res.status(201).json({ message: 'Review added successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Review Save Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

const deleteProductReview = async (req, res) => {
    try {
        const product = await Inventory.findById(req.params.id);

        if (product) {
            const reviewId = req.params.reviewId;
            
            // Check if review exists
            const review = product.reviews.find(r => r._id.toString() === reviewId);
            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }

            // Check authorization (Admin or Reviewer)
            if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to delete this review' });
            }

            // Remove review
            product.reviews = product.reviews.filter(r => r._id.toString() !== reviewId);
            
            // Update counts
            product.numReviews = product.reviews.length;
            if (product.numReviews > 0) {
                const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
                product.rating = totalRating / product.reviews.length;
            } else {
                product.rating = 0;
            }

            product.markModified('reviews');
            await product.save();
            res.json({ message: 'Review removed successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Review Delete Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export { 
    getInventory, 
    getMyInventory, 
    addInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem, 
    getInventoryItemById,
    createProductReview,
    deleteProductReview
};
