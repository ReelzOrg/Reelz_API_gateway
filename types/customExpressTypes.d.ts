import { Express, Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// This makes sure that the user property is available on the request object
// for the authenticateToken middleware primarily but can be used for other purposes as well 
declare global {
	namespace Express {
		interface Request {
			// Use JwtPayload or create your own interface if you know the specific structure
			user?: { userId: string };

			// instead of limiting to the userId, this is general purpose to accommodate any jwt token
			decoded?: JwtPayload | string;

			//we aren't accepting files or using multer but this property is here just for future use
			// we don't have to add the file or files property to the request object because multer already does it
			// in @types/multer/index.d.ts
			// files?: Express.Multer.File[];
		}
	}
}