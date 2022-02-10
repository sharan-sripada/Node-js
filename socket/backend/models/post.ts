import mongoose, { Types , Model, model, Document, Schema } from 'mongoose';
// import mongoose from 'mongoose';
// const Schema = mongoose.Schema;
import { PopulatedDoc } from 'mongoose';
import { IUser } from './user'; 

export interface IPost extends Document{
  title: string,
  imageUrl:string,
  content: string,
  creator: PopulatedDoc<IUser>,
  _doc?: any
}

const postSchema: Schema<IPost> = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    creator: {
      type: Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

//module.exports = mongoose.model('Post', postSchema);
export const Post: Model<IPost> = model('Post', postSchema);
