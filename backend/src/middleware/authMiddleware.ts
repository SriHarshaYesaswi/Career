import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


// Extend Express User interface to include our properties
declare global {
  namespace Express {
    interface User {
      id?: any;
      _id?: any;
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = decoded as any;
      
      return next();
    } catch (error) {
      console.error('JWT Verification failed:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
