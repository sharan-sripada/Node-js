import fs from 'fs';
import path from 'path';

import { validationResult } from 'express-validator/check';

import {io} from '../socket';
import {IPost, Post} from '../models/post';
import {IUser,User} from '../models/user';
import {Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';



export async function getPosts  (req: { query: { page: null; }; } ,res: Response, next: NextFunction)   {
  const currentPage:number =  req.query.page!=null?Number(req.query.page) :1 ;
  const perPage = 2;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate('creator')
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: 'Fetched posts successfully.',
      posts: posts,
      totalItems: totalItems
    });
  } catch (err:any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export async function createPost (req: any,  res: Response, next: NextFunction){
  const errors:any = validationResult(req);
  if (!errors.isEmpty()) {
    const error:any = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error:any = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId
  });
  try {
    await post.save();
    const user:any = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    io.getIO().emit('posts', {
      action: 'create',
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } }
    });
    res.status(201).json({
      message: 'Post created successfully!',
      post: post,
      creator: { _id: user._id, name: user.name }
    });
  } catch (err:any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export async function getPost  (req: Request, res: Response, next: NextFunction)  {
  const postId = req.params.postId;
  const post = await Post.findById(postId);
  try {
    if (!post) {
      const error:any = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: 'Post fetched.', post: post });
  } catch (err:any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export async function updatePost (req: any, res: Response, next: NextFunction) {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error:any = new Error('Validation failed, entered data is incorrect.');
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
    const error:any = new Error('No file picked.');
    error.statusCode = 422;
    throw error;
  }
  try {
    const post = await Post.findById(postId).populate('creator');
    if (!post) {
      const error:any = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId) {
      const error:any = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    const result = await post.save();
    io.getIO().emit('posts', { action: 'update', post: result });
    res.status(200).json({ message: 'Post updated!', post: result });
  } catch (err:any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export async function  deletePost (req:any, res: Response, next: NextFunction)  {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error:any = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error:any = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    // Check logged in user
    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(postId);

    const user = await User.findById(req.userId);
    if(!user||!user.posts){
      throw new Error();
    }
    user.posts.pull(postId);
    await user.save();
    io.getIO().emit('posts', { action: 'delete', post: postId });
    res.status(200).json({ message: 'Deleted post.' });
  } catch (err:any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = (filePath: fs.PathLike) => {
  filePath = path.join(__dirname, '..', filePath.toString());
  fs.unlink(filePath, err => console.log(err));
};
