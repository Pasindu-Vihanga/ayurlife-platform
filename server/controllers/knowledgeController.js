import Knowledge from '../models/Knowledge.js';
import Doctor from '../models/Doctor.js';

// @desc    Get all knowledge articles
// @route   GET /api/knowledge
// @access  Public / Patient
export const getKnowledgeArticles = async (req, res) => {
    try {
        const articles = await Knowledge.find({ status: 'published' })
            .populate({
                path: 'author',
                populate: { path: 'user', select: 'name' }
            })
            .sort({ createdAt: -1 });
            
        res.json(articles);
    } catch (error) {
        console.error('Error fetching knowledge articles:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get knowledge article by ID
// @route   GET /api/knowledge/:id
// @access  Public
export const getKnowledgeArticleById = async (req, res) => {
    try {
        const article = await Knowledge.findById(req.params.id)
            .populate({
                path: 'author',
                populate: { path: 'user', select: 'name' }
            });
            
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        
        res.json(article);
    } catch (error) {
        console.error('Error fetching article by ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get logged in doctor's articles
// @route   GET /api/knowledge/my
// @access  Private (Doctor)
export const getMyKnowledgeArticles = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }
        
        const myArticles = await Knowledge.find({ author: doctor._id }).sort({ createdAt: -1 });
        res.json(myArticles);
    } catch (error) {
        console.error('Error fetching my articles:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all knowledge articles for admin
// @route   GET /api/knowledge/all
// @access  Private (Admin)
export const getAllKnowledgeArticlesForAdmin = async (req, res) => {
    try {
        const articles = await Knowledge.find({})
            .populate({
                path: 'author',
                populate: { path: 'user', select: 'name' }
            })
            .sort({ createdAt: -1 });
            
        res.json(articles);
    } catch (error) {
        console.error('Error fetching all knowledge articles:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new knowledge article
// @route   POST /api/knowledge
// @access  Private (Doctor/Admin)
export const createKnowledgeArticle = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }
        
        const article = new Knowledge({
            title,
            content,
            category,
            author: doctor._id
        });
        
        const createdArticle = await article.save();
        res.status(201).json(createdArticle);
    } catch (error) {
        console.error('Error creating knowledge article:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Publish an article
// @route   PUT /api/knowledge/:id/publish
// @access  Private (Admin)
export const publishKnowledgeArticle = async (req, res) => {
    try {
        const article = await Knowledge.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        
        article.status = 'published';
        const updatedArticle = await article.save();
        res.json(updatedArticle);
    } catch (error) {
        console.error('Error publishing knowledge article:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete an article
// @route   DELETE /api/knowledge/:id
// @access  Private (Admin/Doctor)
export const deleteKnowledgeArticle = async (req, res) => {
    try {
        const article = await Knowledge.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        if (req.user.role !== 'admin') {
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (!doctor || article.author.toString() !== doctor._id.toString()) {
                 return res.status(403).json({ message: 'Not authorized' });
            }
        }

        await article.deleteOne();
        res.json({ message: 'Article removed' });
    } catch (error) {
        console.error('Error deleting knowledge article:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Like/Unlike an article
// @route   PUT /api/knowledge/:id/like
// @access  Private
export const likeKnowledgeArticle = async (req, res) => {
    try {
        const article = await Knowledge.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        const alreadyLiked = article.likes.find(id => id.toString() === req.user._id.toString());

        if (alreadyLiked) {
            article.likes = article.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            article.likes.push(req.user._id);
        }

        await article.save();
        res.json({ likes: article.likes.length, isLiked: !alreadyLiked });
    } catch (error) {
        console.error('Error liking article:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Increment share count
// @route   PUT /api/knowledge/:id/share
// @access  Public
export const shareKnowledgeArticle = async (req, res) => {
    try {
        const article = await Knowledge.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        article.shares = (article.shares || 0) + 1;
        await article.save();
        res.json({ shares: article.shares });
    } catch (error) {
        console.error('Error sharing article:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
