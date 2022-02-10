"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const check_1 = require("express-validator/check");
const feedController = __importStar(require("../controllers/feed"));
const is_auth_1 = require("../middleware/is-auth");
const router = express_1.default.Router();
// GET /feed/posts
router.get('/posts', is_auth_1.isAuth, feedController.getPosts);
// POST /feed/post
router.post('/post', is_auth_1.isAuth, [
    (0, check_1.body)('title')
        .trim()
        .isLength({ min: 5 }),
    (0, check_1.body)('content')
        .trim()
        .isLength({ min: 5 })
], feedController.createPost);
router.get('/post/:postId', is_auth_1.isAuth, feedController.getPost);
router.put('/post/:postId', is_auth_1.isAuth, [
    (0, check_1.body)('title')
        .trim()
        .isLength({ min: 5 }),
    (0, check_1.body)('content')
        .trim()
        .isLength({ min: 5 })
], feedController.updatePost);
router.delete('/post/:postId', is_auth_1.isAuth, feedController.deletePost);
// module.exports = router;
exports.default = router;
