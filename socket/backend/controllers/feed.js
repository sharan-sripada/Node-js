"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.getPost = exports.createPost = exports.getPosts = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const check_1 = require("express-validator/check");
const socket_1 = require("../socket");
const post_1 = require("../models/post");
const user_1 = require("../models/user");
function getPosts(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentPage = req.query.page != null ? Number(req.query.page) : 1;
        const perPage = 2;
        try {
            const totalItems = yield post_1.Post.find().countDocuments();
            const posts = yield post_1.Post.find()
                .populate('creator')
                .sort({ createdAt: -1 })
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
            res.status(200).json({
                message: 'Fetched posts successfully.',
                posts: posts,
                totalItems: totalItems
            });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    });
}
exports.getPosts = getPosts;
;
function createPost(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = (0, check_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }
        if (!req.file) {
            const error = new Error('No image provided.');
            error.statusCode = 422;
            throw error;
        }
        const imageUrl = req.file.path;
        const title = req.body.title;
        const content = req.body.content;
        const post = new post_1.Post({
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator: req.userId
        });
        try {
            yield post.save();
            const user = yield user_1.User.findById(req.userId);
            user.posts.push(post);
            yield user.save();
            socket_1.io.getIO().emit('posts', {
                action: 'create',
                post: Object.assign(Object.assign({}, post._doc), { creator: { _id: req.userId, name: user.name } })
            });
            res.status(201).json({
                message: 'Post created successfully!',
                post: post,
                creator: { _id: user._id, name: user.name }
            });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    });
}
exports.createPost = createPost;
;
function getPost(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const postId = req.params.postId;
        const post = yield post_1.Post.findById(postId);
        try {
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'Post fetched.', post: post });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    });
}
exports.getPost = getPost;
;
function updatePost(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const postId = req.params.postId;
        const errors = (0, check_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }
        const title = req.body.title;
        const content = req.body.content;
        let imageUrl = req.body.image;
        if (req.file) {
            imageUrl = req.file.path;
        }
        if (!imageUrl) {
            const error = new Error('No file picked.');
            error.statusCode = 422;
            throw error;
        }
        try {
            const post = yield post_1.Post.findById(postId).populate('creator');
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }
            if (post.creator._id.toString() !== req.userId) {
                const error = new Error('Not authorized!');
                error.statusCode = 403;
                throw error;
            }
            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl);
            }
            post.title = title;
            post.imageUrl = imageUrl;
            post.content = content;
            const result = yield post.save();
            socket_1.io.getIO().emit('posts', { action: 'update', post: result });
            res.status(200).json({ message: 'Post updated!', post: result });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    });
}
exports.updatePost = updatePost;
;
function deletePost(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const postId = req.params.postId;
        try {
            const post = yield post_1.Post.findById(postId);
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }
            if (post.creator.toString() !== req.userId) {
                const error = new Error('Not authorized!');
                error.statusCode = 403;
                throw error;
            }
            // Check logged in user
            clearImage(post.imageUrl);
            yield post_1.Post.findByIdAndRemove(postId);
            const user = yield user_1.User.findById(req.userId);
            if (!user || !user.posts) {
                throw new Error();
            }
            user.posts.pull(postId);
            yield user.save();
            socket_1.io.getIO().emit('posts', { action: 'delete', post: postId });
            res.status(200).json({ message: 'Deleted post.' });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    });
}
exports.deletePost = deletePost;
;
const clearImage = (filePath) => {
    filePath = path_1.default.join(__dirname, '..', filePath.toString());
    fs_1.default.unlink(filePath, err => console.log(err));
};
