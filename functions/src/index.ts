import { Request, Response, https } from 'firebase-functions';
import MiniRouter  from './MiniRouter.js';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

const miniRouter = new MiniRouter();

miniRouter.get('/unimplemented');

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
