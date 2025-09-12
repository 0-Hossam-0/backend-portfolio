import UserCollection from '../models/user.model';
import bcrypt from 'bcryptjs';
import { User } from './validations/user.validator';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

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
