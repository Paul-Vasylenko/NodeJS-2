import { Request, Response } from 'firebase-functions';
import defaultHandler from './defaultHandler';

export const METHODS = {
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT',
	DELETE: 'DELETE',
	PATCH: 'PATCH',
	OPTIONS: 'OPTIONS',
	HEAD: 'HEAD',
	CONNECT: 'CONNECT',
	TRACE: 'TRACE',
};

export type TMethods = keyof typeof METHODS;

type Handler = (req: Request, res: Response) => void | Promise<void>;

function parse(str: string) {
	let c,
		tmp,
		pattern = '';
	const arr = str.split('/');
	const keys = [];
	if (arr[0] === '') arr.shift();

	tmp = arr.shift();
	while (tmp) {
		c = tmp[0];
		if (c === '*') {
			keys.push('wild');
			pattern += '/(.*)';
		} else if (c === ':') {
			keys.push(tmp.substring(1, tmp.length));
			pattern += '/([^/]+?)';
		} else {
			pattern += '/' + tmp;
		}
		tmp = arr.shift();
	}

	return {
		keys,
		pattern: new RegExp('^' + pattern + '\\/?$', 'i'),
	};
}

type HandlerMap = Map<string, Map<TMethods, Handler>>;

export default class {
	// private handlers: { [path: string | RegExp]: { [method: string]: Handler[] } } = {};
	private handlers: HandlerMap = new Map();

	private keys: Map<string, string[]> = new Map();

	public add(method: TMethods, path: string, handler?: Handler) {
		if (!handler) handler = defaultHandler;
		const { keys } = parse(path);

		this.keys.set(path, keys);

		if (!this.handlers.get(path)) this.handlers.set(path, new Map());

		if (!this.handlers.get(path)?.get(method)) {
			// first handler for this path or method
			const oldHandlers: Map<TMethods, Handler> = this.handlers.get(path) || new Map();
			oldHandlers.set(method, handler);
			return;
		}
		// not first handler
		const methodMap = new Map();
		methodMap.set(method, handler);
		this.handlers.set(path, methodMap);
	}

	public async handle(req: Request, res: Response) {
		const { url, method } = req;

		const handlerKeys = this.handlers.keys();
		let path = handlerKeys.next().value;
		let rx = parse(path).pattern;
		let handler: Handler = defaultHandler;
		let keys: string[] = [];
		let matches;
		const params: Record<string, string> = {};
		while (rx !== undefined) {
			const match = url.match(rx);
			if (match) {
				matches = rx.exec(url);
				handler = this.handlers.get(path)?.get(method as TMethods) || handler;
				keys = this.keys.get(path) || [];
				break;
			}

			path = handlerKeys.next().value;
			rx = parse(path).pattern;
		}

		if (matches) {
			for (let i = 0; i < keys.length; ) {
				params[keys[i]] = matches[++i];
			}
		}
		// reassigne req.params to get in handler
		req.params = params;

		await handler(req, res);
	}

	public get(path: string, handler?: Handler) {
		this.add(METHODS.GET as TMethods, path, handler);
	}

	public post(path: string, handler?: Handler) {
		this.add(METHODS.POST as TMethods, path, handler);
	}

	public put(path: string, handler?: Handler) {
		this.add(METHODS.PUT as TMethods, path, handler);
	}

	public delete(path: string, handler?: Handler) {
		this.add(METHODS.DELETE as TMethods, path, handler);
	}

	public patch(path: string, handler?: Handler) {
		this.add(METHODS.PATCH as TMethods, path, handler);
	}

	public options(path: string, handler?: Handler) {
		this.add(METHODS.OPTIONS as TMethods, path, handler);
	}

	public head(path: string, handler?: Handler) {
		this.add(METHODS.HEAD as TMethods, path, handler);
	}

	public connect(path: string, handler?: Handler) {
		this.add(METHODS.CONNECT as TMethods, path, handler);
	}

	public trace(path: string, handler?: Handler) {
		this.add(METHODS.TRACE as TMethods, path, handler);
	}
}
