import mongoose from 'mongoose';

const forumSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
        required: true,
        default: 'General',
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    answers: [{
        content: String,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        isProfessional: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['active', 'hidden', 'flagged'],
        default: 'active',
    },
    isResolved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

const Forum = mongoose.model('Forum', forumSchema);

export default Forum;
