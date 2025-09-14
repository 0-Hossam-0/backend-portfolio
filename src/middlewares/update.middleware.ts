import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { Update, UpdateSchema } from './validations/update.validator';
import UpdatesCollection from '../models/updates.model';
import path from 'path';
import fs from 'fs';
import { getGridFSBucket } from '../database/connect';
import mongoose from 'mongoose';

export const createUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, postDate }: Update = req.body;
    const savedFileIds: mongoose.Types.ObjectId[] = [];

    if (Array.isArray(req.files)) {
      const bucket = getGridFSBucket();
      for (const file of req.files as Express.Multer.File[]) {
        const uploadStream = bucket.openUploadStream(`${Date.now()}-${file.originalname}`);
        uploadStream.end(file.buffer);

        // wait until finish before pushing id
        await new Promise<void>((resolve, reject) => {
          uploadStream.on('finish', () => {
            savedFileIds.push(uploadStream.id as mongoose.Types.ObjectId);
            resolve();
          });
          uploadStream.on('error', reject);
        });
      }
    }

    const route = title.replace(/\s+/g, '-').toLowerCase();

    await UpdatesCollection.create({
      title,
      description,
      postDate,
      images: savedFileIds,
      route,
    });

    return res.status(StatusCodes.CREATED).json({
      message: 'Update created successfully',
    });
  } catch (error) {
    console.error(error);
    next(new Error('Something went wrong.'));
  }
};
export const modifyUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const savedFileIds: mongoose.Types.ObjectId[] = [];

    for (const file of files) {
      const bucket = getGridFSBucket();
      const uploadStream = bucket.openUploadStream(`${Date.now()}-${file.originalname}`);
      uploadStream.end(file.buffer);

      await new Promise<void>((resolve, reject) => {
        uploadStream.on('finish', () => {
          savedFileIds.push(uploadStream.id as mongoose.Types.ObjectId);
          resolve();
        });
        uploadStream.on('error', reject);
      });
    }

    const updatedFields: any = {
      ...(req.body.title && { title: req.body.title }),
      ...(req.body.description && { description: req.body.description }),
      ...(req.body.postDate && { postDate: req.body.postDate }),
    };

    if (savedFileIds.length > 0) {
      updatedFields.images = savedFileIds;
    }

    const result = await UpdatesCollection.updateOne({ title: req.params.title }, { $set: updatedFields });

    if (result.modifiedCount > 0) {
      return res.status(StatusCodes.ACCEPTED).json({ message: 'Update updated successfully.' });
    }

    next(new Error('Update not found or not updated.'));
  } catch (error) {
    console.error(error);
    next(new Error('Something went wrong.'));
  }
};

export const deleteUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title } = req.params as Pick<Update, 'title'>;
    const update = await UpdatesCollection.findOne({ title });

    if (update?.images && Array.isArray(update.images)) {
      for (const imagePath of update.images) {
        try {
          await fs.promises.unlink(imagePath);
        } catch (err) {
          console.warn(`Failed to delete image: ${imagePath}`);
        }
      }
    }

    const result = await UpdatesCollection.deleteOne({ title });
    if (result.deletedCount > 0) {
      return res.status(StatusCodes.ACCEPTED).json({
        message: 'Update deleted successfully.',
      });
    }

    next(new Error('Update not found.'));
  } catch (error) {
    console.error(error);
    next(new Error('Something went wrong.'));
  }
};

export const getUpdates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = await UpdatesCollection.find({}, 'title description postDate images');
    const updatesWithFullUrls = updates.map((update) => ({
      ...update.toObject(),
      images: update.images.map((img) => `${process.env.FULL_DOMAIN}/images/${img}`),
    }));

    return res.status(StatusCodes.ACCEPTED).json(updatesWithFullUrls);
  } catch (error) {
    console.log(error);
    next(new Error('Something went wrong.'));
  }
};

export const getUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title } = req.params;

    const update = await UpdatesCollection.findOne(
      { route: title.replace(/\s+/g, '-').toLowerCase() },
      'title description images postDate'
    );
    if (update) {
      const updateWithFullUrls = {
        ...update.toObject(),
        images: update.images.map((img) => `${process.env.FULL_DOMAIN}/images/${img}`),
      };

      return res.status(StatusCodes.OK).json(updateWithFullUrls);
    }
  } catch (error) {
    console.error(error);
    next(new Error('Something went wrong.'));
  }
};

export const checkIfUpdateExist = async (req: Request, res: Response, next: NextFunction) => {
  const title = req.params?.title || req.body?.title;
  const exists = await UpdatesCollection.findOne({ route: title.replace(/\s+/g, '-').toLowerCase() });
  if (req.method === 'POST' && exists)
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Update already exists' });
  else if (req.method !== 'POST' && !exists)
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Update doesn't exist" });

  next();
};

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const result = UpdateSchema.safeParse(req.body);
  if (!result.success) {
    return next(result.error);
  }
  next();
};
