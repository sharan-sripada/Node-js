"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const multer_1 = __importDefault(require("multer"));
const socket_1 = require("./socket");
const feed_1 = __importDefault(require("./routes/feed"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
const fileStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(body_parser_1.default.json()); // application/json
app.use((0, multer_1.default)({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use('/images', express_1.default.static(path_1.default.join(__dirname, 'images')));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use('/feed', feed_1.default);
app.use('/auth', auth_1.default);
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});
mongoose_1.default
    .connect('mongodb+srv://sai:mongo123@cluster0.tuvoe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
    .then(result => {
    const server = app.listen(8080);
    const iovar = socket_1.io.init(server);
    iovar.on('connection', (socket) => {
        console.log('Client connected');
    });
})
    .catch(err => console.log(err));
