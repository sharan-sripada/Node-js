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
exports.updateUserStatus = exports.getUserStatus = exports.login = exports.signup = void 0;
const check_1 = require("express-validator/check");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../models/user");
function signup(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = (0, check_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed.');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const email = req.body.email;
        const name = req.body.name;
        const password = req.body.password;
        try {
            const hashedPw = yield bcryptjs_1.default.hash(password, 12);
            const user = new user_1.User({
                email: email,
                password: hashedPw,
                name: name
            });
            const result = yield user.save();
            res.status(201).json({ message: 'User created!', userId: result._id });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    });
}
exports.signup = signup;
;
function login(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const email = req.body.email;
        const password = req.body.password;
        let loadedUser;
        try {
            const user = yield user_1.User.findOne({ email: email });
            if (!user) {
                const error = new Error('A user with this email could not be found.');
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            const isEqual = yield bcryptjs_1.default.compare(password, user.password);
            if (!isEqual) {
                const error = new Error('Wrong password!');
                error.statusCode = 401;
                throw error;
            }
            const token = jsonwebtoken_1.default.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            }, 'somesupersecretsecret', { expiresIn: '1h' });
            res.status(200).json({ token: token, userId: loadedUser._id.toString() });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    });
}
exports.login = login;
;
function getUserStatus(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield user_1.User.findById(req.userId);
            if (!user) {
                const error = new Error('User not found.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ status: user.status });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    });
}
exports.getUserStatus = getUserStatus;
;
function updateUserStatus(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const newStatus = req.body.status;
        try {
            const user = yield user_1.User.findById(req.userId);
            if (!user) {
                const error = new Error('User not found.');
                error.statusCode = 404;
                throw error;
            }
            user.status = newStatus;
            yield user.save();
            res.status(200).json({ message: 'User updated.' });
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    });
}
exports.updateUserStatus = updateUserStatus;
;
