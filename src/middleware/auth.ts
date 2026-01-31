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

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
        if (err) return res.sendStatus(401);
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

