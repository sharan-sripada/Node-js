import path from 'path';

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import multer from 'multer';

import {io} from './socket';
import feedRoutes from './routes/feed';
import authRoutes from './routes/auth';

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: (arg0: any, arg1: string) => void) => {
    cb(null, 'images');
  },
  filename: (req: any, file: { originalname: string; }, cb: (arg0: any, arg1: string) => void) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req: any, file: { mimetype: string; }, cb: (arg0: any, arg1: boolean) => void) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req: any, res: { setHeader: (arg0: string, arg1: string) => void; }, next: () => void) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error: any, req: any, res:  any, next: any) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    'mongodb+srv://sai:mongo123@cluster0.tuvoe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
  )
  .then(result => {
    const server = app.listen(8080);
    const iovar = io.init(server);
    iovar.on('connection', (socket: any) => {
      console.log('Client connected');
    });
  })
  .catch(err => console.log(err));
