import { Response, Request } from 'firebase-functions';

function defaultHandler(req: Request, res: Response) {
	res.json({ name: 'method not implemented' });
}
export default defaultHandler;
