import 'dotenv/config.js';
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { requiredEnv } from '../utils/general.js';

//the req.user has the userId
export default function authenticateToken(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers['authorization'];
	const jwtToken = authHeader && authHeader.split(' ')[1];

	if (!jwtToken) return res.status(401).json({ message: 'Unauthorized: No jwt token provided' });
	const secret = requiredEnv("JWT_SECRET", "");

	jwt.verify(jwtToken, secret, (err, decoded) => {
		if (err) return res.status(403).json({ message: 'Forbidden: Invalid jwt token' });
		// The .user property comes from the types/customExpressTypes.d.ts file
		// decoded is usally of type object | string but we know that it is of type {userId: string}
		req.user = decoded as { userId: string }; // Attach decoded user ID to request object
		next();
	});
}