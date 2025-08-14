import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
      unique:true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
  },
  {
    collection: 'user',
    timestamps: true,
  }
);

const UserCollection = mongoose.model('user', userSchema);
UserCollection.syncIndexes();
export default UserCollection;
