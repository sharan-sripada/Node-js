"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
let iovar;
class io {
    static init(httpServer) {
        iovar = require('socket.io')(httpServer);
        return iovar;
    }
    static getIO() {
        if (!iovar) {
            throw new Error('Socket.io not initialized!');
        }
        return iovar;
    }
}
exports.io = io;
;
