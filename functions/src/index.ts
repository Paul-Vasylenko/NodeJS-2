import { Request, Response, https, logger } from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

export const hello = https.onRequest((req: Request, res: Response) => {
	logger.log('Testing firebase logger here');

	res.json({
		message: 'test auto deploy !',
		cookies: req.cookies,
		body: req.body,
		query: req.query,
	});
});
