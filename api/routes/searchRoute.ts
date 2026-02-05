import express from 'ultimate-express';
import type { Router, Request, Response } from 'ultimate-express';
// import { search } from '../../utils/typesenseUtils';
import { searchTypeSense } from '../../dbFuncs/typesenseFuncs.js';
const router: Router = express.Router();

router.get("/", async (req: Request, res: Response) => {
	try {
		const result = await searchTypeSense(
			'users', //Collection name
			req.query.searchTerm as string, //search term
			"username,first_name,last_name", //query_by
			req.query.filters as string || "" //filters
		);

		// console.log("THESE ARE THE SEARCH RESULTS:", result.hits.map(hit => hit.document));
		console.log("The typesense search took this much time: ", result.search_time_ms)

		res.json(result.hits?.map(hit => hit.document));
	} catch (error: any) {
		res.status(500).json({ success: false, error: error.message });
	}
});

export default router;