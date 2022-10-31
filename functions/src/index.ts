import { Request, Response, https } from 'firebase-functions';
import MiniRouter, { METHODS } from './MiniRouter.js';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

const miniRouter = new MiniRouter();

miniRouter.add(METHODS.GET, '/', (req, res) => {
	res.json({
		success: true,
		body: req.body,
	});
});

miniRouter.post('/api/test', (req, res) => {
	res.json({
		success: true,
		method: req.method,
		url: req.url,
		message: 'POST /api/test works!',
		body: req.body,
	});
});

miniRouter.get('/api/test', (req, res) => {
	res.json({
		success: true,
		method: req.method,
		url: req.url,
		message: 'GET /api/test works!',
	});
});

export const router = https.onRequest((req: Request, res: Response) => {
	try {
		miniRouter.handle(req, res);
	} catch (e: unknown) {
		if (e instanceof https.HttpsError && e.code === 'unimplemented') {
			res.status(404).json({
				errors: [
					{
						code: e.code,
						status: 404,
						detail: e.message,
					},
				],
			});
		}

		res.status(500).json({
			errors: [
				{
					code: 'INTERNAL_SERVER_ERROR',
					status: 500,
					detail: 'Internal Server Error',
				},
			],
		});
	}
});
