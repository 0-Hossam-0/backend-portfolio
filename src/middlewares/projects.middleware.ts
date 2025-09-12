import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { Project, ProjectSchema } from './validations/project.validator';
import ProjectCollection from '../models/project.model';
import path from 'path';
import fs from 'fs';

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, technologies, githubLink }: Project = req.body;
    const savedFilenames: string[] = [];

    if (Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        const filename = `${Date.now()}-${file.originalname}`;
        const filepath = path.join('images', filename);
        await fs.promises.writeFile(filepath, file.buffer);
        savedFilenames.push(filename);
      }
    }
    const route = title.replace(/\s+/g, '-').toLowerCase();
    await ProjectCollection.create({
      title,
      description,
      images: savedFilenames,
      technologies: technologies,
      githubLink: githubLink,
      route: route,
    });
    return res.status(StatusCodes.CREATED).json({
      message: `Project created successfully`,
    });
  } catch (error) {
    console.log(error);
    next(new Error('Something went wrong.'));
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  const { title } = req.params as Pick<Project, 'title'>;
  console.log(title);
  console.log(title.replace(/\s+/g, '-').toLowerCase());
  const result = await ProjectCollection.deleteOne({ route: title.replace(/\s+/g, '-').toLowerCase() });
  if (result) {
    return res.status(StatusCodes.ACCEPTED).json({
      message: 'Project got deleted successfully.',
    });
  }
  next(new Error('Something went wrong.'));
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const savedFilePaths: string[] = [];
    const existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];

    if (Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        const filename = `${Date.now()}-${file.originalname}`;
        const filepath = path.join('images', filename);
        await fs.promises.writeFile(filepath, file.buffer);
        savedFilePaths.push(filename);
      }
    }

    const projectData = res.locals.projectData;
    if (projectData) {
      const updatedProject = {
        title: req.body.title || projectData.title,
        technologies: req.body.technologies || projectData.technologies,
        description: req.body.description || projectData.description,
        githubLink: req.body.githubLink || projectData.githubLink,
        images: [...existingImages, ...savedFilePaths],
        route: req.body.title.replace(/\s+/g, '-').toLowerCase(),
      };

      await ProjectCollection.updateOne({ route: req.params.title.replace(/\s+/g, '-').toLowerCase() }, { $set: updatedProject });

      return res.status(StatusCodes.ACCEPTED).json({
        message: 'Project updated successfully.',
        project: updatedProject,
      });
    }
  } catch (error) {
    console.error(error);
    next(new Error('Something went wrong.'));
  }
};
export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await ProjectCollection.find({}, 'title description images technologies githubLink');

    if (Array.isArray(projects)) {
      const formattedProjects = projects.map((project) => ({
        title: project.title,
        description: project.description,
        technologies: project.technologies,
        githubLink: project.githubLink,
        images: project.images.map((image: string) => `${process.env.FULL_DOMAIN}/images/${image}`),
      }));

      return res.status(StatusCodes.ACCEPTED).json(formattedProjects);
    } else {
      return res.status(StatusCodes.ACCEPTED).json({ message: 'No projects found' });
    }
  } catch (error) {
    console.log(error);
    next(new Error('Something went wrong.'));
  }
};

export const getProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.params.title.replace(/\s+/g, '-').toLowerCase());
    const project: (Project & { images: string[] }) | null = await ProjectCollection.findOne(
      { route: req.params.title.replace(/\s+/g, '-').toLowerCase() },
      'title description images technologies githubLink'
    );
    if (project) {
      const formattedImages = project.images.map((image: string) => `${process.env.FULL_DOMAIN}/images/${image}`);
      return res.status(StatusCodes.OK).json({
        title: project.title,
        description: project.description,
        technologies: project.technologies,
        githubLink: project.githubLink,
        images: formattedImages,
      });
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Project not found' });
    }
  } catch (error) {
    console.log(error);
    next(new Error('Something went wrong.'));
  }
};

export const checkIfProjectExist = async (req: Request, res: Response, next: NextFunction) => {
  const title = req.params?.title || req.body?.title;
  console.log(title.replace(/\s+/g, '-').toLowerCase());
  const exists = await ProjectCollection.findOne({ route: title.replace(/\s+/g, '-').toLowerCase() });

  if (req.method === 'POST' && exists)
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Project already exists' });
  else if (req.method !== 'POST' && !exists)
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Project doesn't exist" });
  res.locals.projectData = exists;
  next();
};

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body);
  const result = ProjectSchema.safeParse(req.body);
  if (!result.success) {
    return next(result.error);
  }
  next();
};
