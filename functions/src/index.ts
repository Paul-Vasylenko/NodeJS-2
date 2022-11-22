import { Request, Response, https } from 'firebase-functions';
import MiniRouter from './MiniRouter.js';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

const miniRouter = new MiniRouter();

// check unimplemented
miniRouter.get('/unimplemented');

// check 2 similar routes
miniRouter.get('/helloWorld', (req, res) => {
	res.send('First');
});

miniRouter.get('/helloWorld', (req, res) => {
	res.json({
		rewriten: true,
	});
});

// check different methods on single route
miniRouter.get('/cats', (req, res) => {
	res.json({
		url: req.url,
		method: 'GET!!!',
	});
});

miniRouter.post('/cats', (req, res) => {
	res.json({
		url: req.url,
		method: 'POST!!!',
	});
});

miniRouter.put('/cats', (req, res) => {
	res.json({
		url: req.url,
		method: 'PUT!!!',
	});
});

miniRouter.options('/cats', (req, res) => {
	res.json({
		url: req.url,
		method: 'OPTIONS!!!',
	});
});

// check *
miniRouter.get('/heroes/*', (req, res) => {
	res.json({
		route: '/heroes/*',
		success: true,
	});
});

// check :id (params)
miniRouter.get('/schools/:id', (req, res) => {
	res.json({
		route: '/schools/:id',
		params: req.params,
	});
});

miniRouter.get('/schools/:id/hello/:param', (req, res) => {
	res.json({
		route: '/schools/:id/hello/:param',
		params: req.params,
	});
});

export const router = https.onRequest((req: Request, res: Response) => {
	try {
		miniRouter.handle(req, res);
	} catch (e: unknown) {
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
