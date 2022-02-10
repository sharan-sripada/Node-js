import { validationResult } from 'express-validator/check';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {IUser,User} from '../models/user';
import { Request ,Response,NextFunction} from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export async function signup  (req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error:any = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  try {
    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({
      email: email,
      password: hashedPw,
      name: name
    });
    const result = await user.save();
    res.status(201).json({ message: 'User created!', userId: result._id });
  } catch (err:any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export async function login (req: Request, res: Response, next: NextFunction){
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error:any = new Error('A user with this email could not be found.');
      error.statusCode = 401;
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error:any = new Error('Wrong password!');
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString()
      },
      'somesupersecretsecret',
      { expiresIn: '1h' }
    );
    res.status(200).json({ token: token, userId: loadedUser._id.toString() });
  } catch (err:any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export async function  getUserStatus (req: any, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error:any = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ status: user.status });
  } catch (err:any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export async function updateUserStatus (req: any, res: Response, next: NextFunction) {
  const newStatus = req.body.status;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error:any = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    user.status = newStatus;
    await user.save();
    res.status(200).json({ message: 'User updated.' });
  } catch (err:any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


