import 'dotenv/config.js';
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'ultimate-express';
import { requiredEnv } from '../utils/general.js';

//the req.user has the userId
export default function authenticateToken(req: Request, res: Response, next: NextFunction, jwtSecretKey?: string) {
	const authHeader = req.headers['authorization'];
	const jwtToken = authHeader && authHeader.split(' ')[1];

	if (!jwtToken) return res.status(401).json({ success: false, message: 'Unauthorized: No jwt token provided' });
	const secret = requiredEnv(jwtSecretKey || "JWT_SECRET", "");

	jwt.verify(jwtToken, secret, (err, decoded) => {
		if (err) return res.status(403).json({ success: false, message: 'Forbidden: Invalid jwt token' });
		// The .user property comes from the types/customExpressTypes.d.ts file
		// decoded is usually of type object | string but we know that it is of type {userId: string}

		// TODO: This is not very clean code, remove the user property to only use decoded
		jwtSecretKey ? req.decoded = decoded : req.user = decoded as { userId: string }; // Attach decoded user ID to request object
		next();
	});
}