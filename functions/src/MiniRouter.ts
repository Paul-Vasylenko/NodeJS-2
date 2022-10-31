import { Request, Response, https } from 'firebase-functions';

export enum METHODS {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE',
	PATCH = 'PATCH',
	OPTIONS = 'OPTIONS',
	HEAD = 'HEAD',
	CONNECT = 'CONNECT',
	TRACE = 'TRACE',
}

type Handler = (req: Request, res: Response) => void | Promise<void>;

export default class {
	private handlers: { [path: string]: { [method: string]: Handler[] } } = {};

	public add(method: METHODS, path: string, ...handlers: Handler[]) {
		if (handlers.length === 0)
			throw new https.HttpsError(
				'unimplemented',
				`No handler for method ${method} and path ${path}`,
			);
		if (!this.handlers[path]?.[method]) {
			// first handler for this path or method
			const oldHandlers = this.handlers[path] || {};
			this.handlers[path] = {
				...oldHandlers,
				[method]: [...handlers],
			};
			return;
		}
		// not first handler
		this.handlers[path][method].push(...handlers);
	}

	public async handle(req: Request, res: Response) {
		const { url, method } = req;
		if (!this.handlers[url]?.[method]) {
			throw new https.HttpsError(
				'unimplemented',
				`No handler for method ${method} and path ${url}`,
			);
		}

		for (const handler of this.handlers[url][method]) {
			await handler(req, res);
		}
	}

	public get(path: string, ...handlers: Handler[]) {
		this.add(METHODS.GET, path, ...handlers);
	}

	public post(path: string, ...handlers: Handler[]) {
		this.add(METHODS.POST, path, ...handlers);
	}

	public put(path: string, ...handlers: Handler[]) {
		this.add(METHODS.PUT, path, ...handlers);
	}

	public delete(path: string, ...handlers: Handler[]) {
		this.add(METHODS.DELETE, path, ...handlers);
	}

	public patch(path: string, ...handlers: Handler[]) {
		this.add(METHODS.PATCH, path, ...handlers);
	}

	public options(path: string, ...handlers: Handler[]) {
		this.add(METHODS.OPTIONS, path, ...handlers);
	}

	public head(path: string, ...handlers: Handler[]) {
		this.add(METHODS.HEAD, path, ...handlers);
	}

	public connect(path: string, ...handlers: Handler[]) {
		this.add(METHODS.CONNECT, path, ...handlers);
	}

	public trace(path: string, ...handlers: Handler[]) {
		this.add(METHODS.TRACE, path, ...handlers);
	}
}
