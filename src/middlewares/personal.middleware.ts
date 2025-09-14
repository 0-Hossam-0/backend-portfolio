import PersonalCollection from '../models/personal.model';
import { Request, Response, NextFunction } from 'express';
import { personalSchema } from './validations/personal.validator';
import { StatusCodes } from 'http-status-codes';
import { getGridFSBucket } from '../database/connect';

export const getPersonalInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const personalData = await PersonalCollection.findOne();

    if (!personalData) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Personal info not found' });
    }
    console.log(personalData);
    res.status(StatusCodes.OK).json({
      name:personalData.name,
      title:personalData.title,
      location:personalData.location,
      skills:personalData.skills,
      bio:personalData.bio,
      image:`${process.env.FULL_DOMAIN}/images/`+ personalData.image,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const checkPersonalExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const personal = await PersonalCollection.findOne();
    (req as any).personal = personal || null;
    next();
  } catch (error) {
    next(error);
  }
};

export const createOrUpdatePersonalInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedData = personalSchema.parse(req.body);
    let fileId: string | undefined;

    if (req.file) {
      const bucket = getGridFSBucket();

      const filename = `${Date.now()}-${req.file.originalname}`;

      const uploadStream = bucket.openUploadStream(filename, {
        contentType: req.file.mimetype,
      });

      uploadStream.end(req.file.buffer);

      await new Promise<void>((resolve, reject) => {
        uploadStream.on('finish', () => {
          fileId = uploadStream.id.toString();
          resolve();
        });
        uploadStream.on('error', reject);
      });
    }

    const updatedDoc = await PersonalCollection.findOneAndUpdate(
      {},
      {
        ...parsedData,
        ...(fileId && { image: fileId }),
      },
      { upsert: true, new: true }
    );

    return res.status(StatusCodes.OK).json({
      message: 'Personal info saved successfully',
      data: updatedDoc,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};