
let iovar: any;

export class io{
  
  static init(httpServer: any)  {
    iovar = require('socket.io')(httpServer);
    return iovar;
  }

  static getIO() {
    if (!iovar) {
      throw new Error('Socket.io not initialized!');
    }
    return iovar;
  }
};
