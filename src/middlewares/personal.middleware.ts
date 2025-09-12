import PersonalCollection from '../models/personal.model';
import { Request, Response, NextFunction } from 'express';
import { personalSchema } from './validations/personal.validator';
import path from 'path';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';

export const getPersonalInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const personalData = await PersonalCollection.findOne();

    if (!personalData) {
      return res.status(404).json({ message: 'Personal info not found' });
    }
    console.log(personalData);
    res.status(200).json({
      name:personalData.name,
      title:personalData.title,
      location:personalData.location,
      skills:personalData.skills,
      bio:personalData.bio,
      image:`${process.env.FULL_DOMAIN}/images/`+ personalData.image,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
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
    let savedFilename: string | undefined;

    if (req.file) {
      const filename = `${Date.now()}-${req.file.originalname}`;
      const filepath = path.join('images', filename);
      await fs.promises.writeFile(filepath, req.file.buffer);
      savedFilename = filename;
    }

    const updatedDoc = await PersonalCollection.findOneAndUpdate(
      {},
      {
        ...parsedData,
        ...(savedFilename && { image: savedFilename }),
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