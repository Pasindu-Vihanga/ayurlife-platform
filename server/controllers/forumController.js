import Forum from '../models/Forum.js';

// @desc    Get all active forum questions
// @route   GET /api/forum
// @access  Public
export const getForumQuestions = async (req, res) => {
    try {
        const questions = await Forum.find({ status: 'active' })
            .populate('author', 'name role')
            .populate('answers.author', 'name role')
            .sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new question
// @route   POST /api/forum
// @access  Private
export const createQuestion = async (req, res) => {
    try {
        const { question, description, category } = req.body;
        const newQuestion = new Forum({
            question,
            description,
            category,
            author: req.user._id
        });
        const savedQuestion = await newQuestion.save();
        res.status(201).json(savedQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add an answer to a question
// @route   POST /api/forum/:id/answer
// @access  Private
export const addAnswer = async (req, res) => {
    try {
        const { content } = req.body;
        const forum = await Forum.findById(req.params.id);

        if (!forum) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const isProfessional = ['doctor', 'wellness_staff'].includes(req.user.role);

        forum.answers.push({
            content,
            author: req.user._id,
            isProfessional
        });

        await forum.save();
        res.json(forum);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Moderate a question (Hide/Flag)
// @route   PUT /api/forum/:id/status
// @access  Private (Admin)
export const updateForumStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const forum = await Forum.findById(req.params.id);

        if (!forum) {
            return res.status(404).json({ message: 'Question not found' });
        }

        forum.status = status;
        await forum.save();
        res.json(forum);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a question
// @route   DELETE /api/forum/:id
// @access  Private (Admin)
export const deleteQuestion = async (req, res) => {
    try {
        const forum = await Forum.findById(req.params.id);
        if (!forum) {
            return res.status(404).json({ message: 'Question not found' });
        }
        await forum.deleteOne();
        res.json({ message: 'Question removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete an answer
// @route   DELETE /api/forum/:id/answer/:answerId
// @access  Private (Admin)
export const deleteAnswer = async (req, res) => {
    try {
        const forum = await Forum.findById(req.params.id);
        if (!forum) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        forum.answers = forum.answers.filter(ans => ans._id.toString() !== req.params.answerId);
        await forum.save();
        res.json(forum);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
