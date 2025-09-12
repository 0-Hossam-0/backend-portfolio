import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { Experience, ExperienceSchema } from './validations/experience.validator';
import ExperienceCollection from '../models/experience.model';

export const createExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, provider, completionDate, description, technologies, startDate }: Experience = req.body;
    const route = title.replace(/\s+/g, '-').toLowerCase();
    await ExperienceCollection.create({
      title,
      description,
      provider,
      completionDate,
      technologies,
      startDate,
      route: route,
    });
    return res.status(StatusCodes.CREATED).json({
      message: `Experience created successfully`,
    });
  } catch (error) {
    console.log(error);
    next(new Error('Something went wrong.'));
  }
};

export const deleteExperience = async (req: Request, res: Response, next: NextFunction) => {
  const { title } = req.params as Pick<Experience, 'title'>;
  const result = await ExperienceCollection.deleteOne({ title: title });
  if (result) {
    return res.status(StatusCodes.ACCEPTED).json({
      message: 'Experience got deleted successfully.',
    });
  }
  next(new Error('Something went wrong.'));
};

export const updateExperience = async (req: Request, res: Response, next: NextFunction) => {
  console.log('update');
  console.log(req.params.title.replace(/\s+/g, '-').toLowerCase());
  const result = await ExperienceCollection.updateOne(
    { route: req.params.title.replace(/\s+/g, '-').toLowerCase() },
    {
      title: req.body.title,
      description: req.body.description,
      provider: req.body.provider,
      completionDate: req.body.completionDate,
      startDate: req.body.startDate,
      technologies: req.body.technologies,
    }
  );
  if (result) {
    return res.status(StatusCodes.ACCEPTED).json({ message: 'Experience got updated successfully.' });
  }
  next(new Error('Something went wrong.'));
};

export const getExperiences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const experiences = await ExperienceCollection.find(
      {},
      'title description technologies provider completionDate startDate'
    ).lean();
    const formattedExperiences = experiences.map((experience) => ({
      title: experience.title,
      description: experience.description,
      provider: experience.provider,
      completionDate: experience.completionDate,
      technologies: experience.technologies,
      startDate: experience.startDate,
    }));
    return res.status(StatusCodes.OK).send(formattedExperiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    next(new Error('Failed to retrieve experiences'));
  }
};

export const getExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const experience: Experience | null = await ExperienceCollection.findOne(
      { route: req.params.title.replace(/\s+/g, '-').toLowerCase() },
      'title description provider completionDate technologies startDate'
    );
    if (experience) {
      return res.status(StatusCodes.ACCEPTED).json({
        title: experience.title,
        provider: experience.provider,
        completionDate: experience.completionDate,
        startDate: experience.startDate,
        technologies: experience.technologies,
        description: experience.description,
      });
    }
  } catch (error) {
    console.log(error);
    next(new Error('Something went wrong.'));
  }
};

export const checkIfExperienceExist = async (req: Request, res: Response, next: NextFunction) => {
  console.log('update');

  const title = req.params?.title || req.body?.title;
  const exists = await ExperienceCollection.findOne({ route: title.replace(/\s+/g, '-').toLowerCase() });
  if (req.method === 'POST' && exists)
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Experience already exists' });
  else if (req.method !== 'POST' && !exists)
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Experience doesn't exist" });

  next();
};

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body);
  const result = ExperienceSchema.safeParse({
    title: req.body.title,
    provider: req.body.provider,
    completionDate: req.body.completionDate,
    description: req.body.description,
    technologies: req.body.technologies,
    startDate: req.body.startDate,
  });
  if (!result.success) {
    return next(result.error);
  }
  next();
};
