import mongoose, { Types , Model, model, Document, Schema } from 'mongoose';
import { PopulatedDoc } from 'mongoose';
import { IPost } from './post'; 

export interface IUser extends Document{
  email: string,
  password: string,
  name: string, 
  status?: string,
  posts?: PopulatedDoc<IPost>
}
const userSchema: Schema<IUser> = new Schema<IUser>({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'I am new!'
  },
  posts: [
    {
      type: Types.ObjectId,
      ref: 'Post'
    }
  ]
});

//module.exports = mongoose.model('User', userSchema);
export const User: Model<IUser> = model('User', userSchema);
