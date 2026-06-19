import mongoose from 'mongoose';

const knowledgeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        default: 'General',
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'published'],
        default: 'pending',
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    shares: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
});

const Knowledge = mongoose.model('Knowledge', knowledgeSchema);

export default Knowledge;
