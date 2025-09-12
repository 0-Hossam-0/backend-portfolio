import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import ContactInfoCollection from '../models/contact.model';
import { ContactInfo, ContactInfoSchema } from './validations/contact.validator';
import nodemailer from 'nodemailer';
import { ContactMe, ContactMeSchema } from '../models/contactme.model';

export const updateContactInfo = async (req: Request, res: Response, next: NextFunction) => {
  const result = await ContactInfoCollection.findOneAndUpdate(
    {},
    {
      linkedin: req.body.linkedin,
      github: req.body.github,
      email: req.body.email,
      phone: req.body.phone,
    }
  );
  if (result) {
    return res.status(StatusCodes.ACCEPTED).json({ message: 'Contact info got updated successfully.' });
  }
  next(new Error('Something went wrong.'));
};

export const getContactInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contactInfo = await ContactInfoCollection.findOne({});
    if (contactInfo) {
      return res.status(StatusCodes.ACCEPTED).json({
        phone: contactInfo.phone,
        email: contactInfo.email,
        github: contactInfo.github,
        linkedin: contactInfo.linkedin,
      });
    }
  } catch (error) {
    console.log(error);
    next(new Error('Something went wrong.'));
  }
};

export const createContactInfo = async (req: Request, res: Response, next: NextFunction) => {
  const { phone, email, github, linkedin }: ContactInfo = req.body;
  try {
    await ContactInfoCollection.create({ name, phone, email, github, linkedin });
    return res.status(StatusCodes.CREATED).json({
      message: `Course created successfully`,
    });
  } catch (error) {
    console.log(error);
    next(new Error('Something went wrong.'));
  }
};

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const result = ContactInfoSchema.safeParse(req.body);
  if (!result.success) {
    return next(result.error);
  }
  next();
};

export const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, subject, message }: ContactMe = req.body;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailToMe = {
    from: process.env.EMAIL_USER,
    to: process.env.RECEIVING_EMAIL,
    subject: `New message from ${name}: ${subject}`,
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #4CAF50;">📩 New Portfolio Contact</h2>
      <p>You have received a new message from your portfolio contact form:</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Subject</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${subject}</td>
        </tr>
      </table>
      <h3 style="margin-top: 20px;">Message:</h3>
      <p style="white-space: pre-wrap; background: #f9f9f9; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
        ${message}
      </p>
      <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
        This email was sent from your portfolio website's contact form.
      </p>
    </div>`,
  };

  const mailToUser = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `We received your message - ${subject}`,
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #4CAF50;">✅ Message Received</h2>
      <p>Hi ${name},</p>
      <p>Thank you for contacting me through my portfolio website. I’ve received your message and will get back to you as soon as possible.</p>
      <h3>Your message:</h3>
      <p style="white-space: pre-wrap; background: #f9f9f9; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
        ${message}
      </p>
      <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
        This is an automated confirmation email. You don’t need to reply to it.
      </p>
    </div>`,
  };

  try {
    await transporter.sendMail(mailToMe);
    await transporter.sendMail(mailToUser);
    res.status(200).json({ message: 'Email sent successfully to both you and the user' });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const validateContactMe = (req: Request, res: Response, next: NextFunction) => {
  const result = ContactMeSchema.safeParse(req.body);
  if (!result.success) {
    return next(result.error);
  }
  next();
};
