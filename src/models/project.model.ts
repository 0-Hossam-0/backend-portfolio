import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minLength: 5,
    unique: true,
  },
  technologies: {
    type: [String],
    required: true,
  },
  githubLink: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minLength: 100,
  },
  images: {
    type: [String],
    required: true,
    maxLength: 5,
    trim: true,
  },
  route: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const ProjectCollection = mongoose.model('project', projectSchema);
ProjectCollection.syncIndexes();
export default ProjectCollection;
