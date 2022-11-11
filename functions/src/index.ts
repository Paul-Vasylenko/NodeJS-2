import { Request, Response, https } from 'firebase-functions';
import MiniRouter, { METHODS } from './MiniRouter.js';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

const miniRouter = new MiniRouter();

// add method test
miniRouter.add(METHODS.GET, '/', (req, res) => {
	res.json({
		success: true,
		body: req.body,
	});
});

// simple route
miniRouter.get('/api/test', (req, res) => {
	res.json({
		success: true,
		method: req.method,
		url: req.url,
		message: 'GET /api/test works!',
	});
});

// route with * regex
miniRouter.get('/api/helloWorld/*', (req, res) => {
	res.json({
		success: true,
		method: req.method,
		url: req.url,
		message: 'GET /api/helloWorld/* works!',
	});
});

// route with * and something after
miniRouter.get('/api/helloWorld/*/test', (req, res) => {
	res.json({
		success: true,
		method: req.method,
		url: req.url,
		message: 'GET /api/helloWorld/*/test works!',
	});
});

// route with params
miniRouter.get('/api/users/:id', (req, res) => {
	res.json({
		success: true,
		method: req.method,
		params: req.params,
		url: req.url,
		message: 'GET /api/users/:id',
	});
});

miniRouter.get('/api/users/:id/export/:format/test', (req, res) => {
	res.json({
		success: true,
		method: req.method,
		params: req.params,
		url: req.url,
		message: 'GET /api/users/:id/export/:format/test',
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
