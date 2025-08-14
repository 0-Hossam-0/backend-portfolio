import mongoose from 'mongoose';

const contactInfoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    linkedin: { type: String, required: true, trim: true },
    github: { type: String, required: true, trim: true },
  },
  {
    collection: 'contact-info',
    timestamps:true
  }
);

const ContactInfoCollection = mongoose.model('contact-info', contactInfoSchema);
ContactInfoCollection.syncIndexes();
export default ContactInfoCollection;
