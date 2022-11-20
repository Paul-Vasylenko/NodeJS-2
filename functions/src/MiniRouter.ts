import { Request, Response } from 'firebase-functions';
import defaultHandler from "./defaultHandler";

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

type HandlerMap = Map<RegExp, Map<METHODS, Handler[]>>;

export default class {
	// private handlers: { [path: string | RegExp]: { [method: string]: Handler[] } } = {};
	private handlers: HandlerMap = new Map();

	private keys: Map<RegExp, string[]> = new Map();

	public add(method: METHODS, path: string, ...handlers: Handler[]) {
		if (handlers.length === 0)
			handlers.push(defaultHandler);
		const { keys, pattern: handledPath } = parse(path);

		this.keys.set(handledPath, keys);

		if (!this.handlers.get(handledPath)) this.handlers.set(handledPath, new Map());

		if (!this.handlers.get(handledPath)?.get(method)) {
			// first handler for this path or method
			const oldHandlers: Map<METHODS, Handler[]> = this.handlers.get(handledPath) || new Map();
			oldHandlers.set(method, handlers);
			return;
		}
		// not first handler
		const methodMap = new Map();
		methodMap.set(method, handlers);
		this.handlers.set(handledPath, methodMap);
	}

	public async handle(req: Request, res: Response) {
		const { url, method } = req;

		const handlerKeys = this.handlers.keys();
		let rx = handlerKeys.next().value;
		let handlers: Handler[] = [];
		let keys: string[] = [];
		let matches;
		const params: Record<string, string> = {};
		while (rx !== undefined) {
			const match = url.match(rx);
			if (match) {
				matches = rx.exec(url);
				handlers = this.handlers.get(rx)?.get(method as METHODS) || [defaultHandler];
				keys = this.keys.get(rx) || [];
				break;
			}

			rx = handlerKeys.next().value;
		}


		for (let i = 0; i < keys.length; ) {
			params[keys[i]] = matches[++i];
		}
		// reassigne req.params to get in handler
		req.params = params;

		for (const handler of handlers) {
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
