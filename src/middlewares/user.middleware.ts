import UserCollection from '../models/user.model';
import bcrypt from 'bcryptjs';
import { User } from './validations/user.validator';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import PersonalCollection from '../models/personal.model';
import ContactInfoCollection from '../models/contact.model';
import ExperienceCollection from '../models/experience.model';
import ProjectCollection from '../models/project.model';
import UpdatesCollection from '../models/updates.model';

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password }: User = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await UserCollection.create({ username, password: hashedPassword });
    return res.status(StatusCodes.CREATED).json({
      message: `User created successfully`,
    });
  } catch (error) {
    console.log(error);
    next(new Error('Something went wrong.'));
  }
};

const normalizeBaseUrl = () => {
  // ensure no trailing slash
  const raw = process.env.FULL_DOMAIN ?? '';
  return raw.replace(/\/+$/, '');
};

export const getAllData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const baseUrl = normalizeBaseUrl();

    // Run all queries in parallel
    const [personalData, contactInfo, experiences, projects, updates] = await Promise.all([
      PersonalCollection.findOne().lean(),
      ContactInfoCollection.findOne().lean(),
      ExperienceCollection.find({}, 'title description technologies provider completionDate startDate').lean(),
      ProjectCollection.find({}, 'title description images technologies githubLink').lean(),
      UpdatesCollection.find({}, 'title description postDate images').lean(),
    ]);

    // format personal
    const personal = personalData
      ? {
          name: personalData.name ?? null,
          title: personalData.title ?? null,
          location: personalData.location ?? null,
          skills: personalData.skills ?? [],
          bio: personalData.bio ?? null,
          image: personalData.image ? `${baseUrl}/images/${personalData.image}` : null,
        }
      : null;

    // format contact
    const contact = contactInfo
      ? {
          phone: contactInfo.phone ?? null,
          email: contactInfo.email ?? null,
          github: contactInfo.github ?? null,
          linkedin: contactInfo.linkedin ?? null,
        }
      : null;

    // format experiences (keep same field names)
    const formattedExperiences = Array.isArray(experiences)
      ? experiences.map((exp: any) => ({
          title: exp.title ?? null,
          description: exp.description ?? null,
          provider: exp.provider ?? null,
          startDate: exp.startDate ?? null,
          completionDate: exp.completionDate ?? null,
          technologies: exp.technologies ?? [],
        }))
      : [];

    // format projects (map images to full urls)
    const formattedProjects = Array.isArray(projects)
      ? projects.map((proj: any) => ({
          title: proj.title ?? null,
          description: proj.description ?? null,
          technologies: proj.technologies ?? [],
          githubLink: proj.githubLink ?? null,
          images: Array.isArray(proj.images)
            ? proj.images.map((img: string) => (img ? `${baseUrl}/images/${img}` : null)).filter(Boolean)
            : [],
        }))
      : [];

    // format updates (map images)
    const formattedUpdates = Array.isArray(updates)
      ? updates.map((u: any) => ({
          title: u.title ?? null,
          description: u.description ?? null,
          postDate: u.postDate ?? null,
          images: Array.isArray(u.images)
            ? u.images.map((img: string) => (img ? `${baseUrl}/images/${img}` : null)).filter(Boolean)
            : [],
        }))
      : [];

    // single response object
    return res.status(StatusCodes.OK).json({
      personal,
      contact,
      experiences: formattedExperiences,
      projects: formattedProjects,
      updates: formattedUpdates,
    });
  } catch (error) {
    console.error('Error in getAllPublicData:', error);
    next(new Error('Something went wrong.'));
  }
};

// export const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
//   const { title } = req.params as Pick<User, 'title'>;
//   const result = await UserCollection.deleteOne({ title: title });
//   if (result) {
//     return res.status(StatusCodes.ACCEPTED).json({
//       message: 'Course got deleted successfully.',
//     });
//   }
//   next(new Error('Something went wrong.'));
// };

// export const updateCourse = async (req: Request, res: Response, next: NextFunction) => {
//   const result = await UserCollection.updateOne(
//     { title: req.params.title },
//     {
//       title: req.body.title,
//       description: req.body.description,
//       images: req.body.images,
//       provider: req.body.provider,
//       completionDate: req.body.completionDate,
//     }
//   );
//   if (result) {
//     return res.status(StatusCodes.ACCEPTED).json({ message: 'Course got updated successfully.' });
//   }
//   next(new Error('Something went wrong.'));
// };
