import mongoose from 'mongoose';

const updatesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      trim: true,
    },
    route: {
      type: String,
      require: true,
    },
    postDate: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'updates',
  }
);

const UpdatesCollection = mongoose.model('Updates', updatesSchema);

export default UpdatesCollection;
