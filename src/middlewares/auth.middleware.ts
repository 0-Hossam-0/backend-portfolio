import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import UserCollection from '../models/user.model';
import { User, UserSchema } from './validations/user.validator';

declare module 'express-session' {
  interface SessionData {
    user: {
      id: string;
      username: string;
    };
  }
}

export const userLogin = async (req: Request, res: Response) => {
  const { username, password }: User = req.body;

  try {
    const user = await UserCollection.findOne({ username });
    if (!user) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User not found' });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    req.session.user = {
      id: user._id.toString(),
      username: user.username,
    };

    return res.json({ message: 'Logged in successfully' });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' });
  }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User is not Authenticated' });
};

export const authStatus = (req: Request, res: Response) => {
  if (req.session && req.session.user) {
    return res.status(StatusCodes.ACCEPTED).json({ message: 'User is Authenticated' });
  }
  return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User is not Authenticated' });
};

export const userLogout = (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return next(new Error('Logout failed.'));
    }

    res.status(200).json({ message: 'Logged out successfully' });
  });
};

export const checkIfUserExist = async (req: Request, res: Response, next: NextFunction) => {
  const username = req.body?.username;
  const exists = await UserCollection.findOne({ username: username });
  if (req.method === 'POST' && exists)
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User already exists' });

  next();
};

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const result = UserSchema.safeParse(req.body);
  if (!result.success) {
    return next(result.error);
  }
  next();
};
