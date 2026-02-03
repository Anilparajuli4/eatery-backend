import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('authenticateToken - Has auth header:', !!authHeader, 'Has token:', !!token);

    if (!token) {
        console.log('authenticateToken - No token provided');
        return res.sendStatus(401);
    }

    console.log('authenticateToken - Verifying token with secret:', !!process.env.JWT_SECRET);

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
        if (err) {
            console.log('authenticateToken - Token verification failed:', err.message);
            return res.sendStatus(401);
        }
        console.log('authenticateToken - User decoded:', user);
        req.user = user;
        next();
    });
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Require Admin Role' });
    }
    next();
};

export const isStaff = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'STAFF' && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Require Staff or Admin Role' });
    }
    next();
};

