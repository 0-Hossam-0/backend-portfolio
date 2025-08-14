import { Request, Response, NextFunction } from 'express';
import path from 'path';

export const downloadCV = (req: Request, res: Response, next: NextFunction) => {
  const cvPath = path.join(__dirname, '../../files/Hossam-Ahmed-Ali-Ahmed.pdf');
  res.download(cvPath, 'Hossam-Ahmed-Ali-Ahmed.pdf', (err) => {
    if (err) {
      next(err);
    }
  });
};