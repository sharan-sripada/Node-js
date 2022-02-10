"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'I am new!'
    },
    posts: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: 'Post'
        }
    ]
});
//module.exports = mongoose.model('User', userSchema);
exports.User = (0, mongoose_1.model)('User', userSchema);
