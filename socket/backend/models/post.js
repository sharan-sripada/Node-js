"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = require("mongoose");
const postSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose_1.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });
//module.exports = mongoose.model('Post', postSchema);
exports.Post = (0, mongoose_1.model)('Post', postSchema);
