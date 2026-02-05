import type { NextFunction, Request, Response } from 'ultimate-express';

export default function checkUserAuthorization(req: Request, res: Response, next: NextFunction) {
	const loggedInUserId = req.user?.userId;
	const apiID = req.params.id;
	// console.log("The user ids are:", loggedInUserId, apiID);

	if (loggedInUserId != apiID) {
		return res.json({ success: false, message: "You are not authorized to perform this action" })
	}
	next();
}