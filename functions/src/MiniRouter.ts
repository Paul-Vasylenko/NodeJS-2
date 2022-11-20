import { Request, Response } from 'firebase-functions';
import { URLSearchParams } from 'url';
import defaultHandler from './defaultHandler';
import { safeJSON } from './helpers';

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
const processedContentTypes = {
	'text/html': (text: string) => text,
	'text/plain': (text: string) => text,
	'application/json': (json: string) => safeJSON(json, {}),
	'x-www-form-urlencoded': (data: string) =>
		Object.fromEntries(new URLSearchParams(data)) as Record<string, string>,
};
type TProcessedContentTypes = typeof processedContentTypes;

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

type HandlerMap = Map<string, Map<METHODS, Handler>>;

export default class {
	// private handlers: { [path: string | RegExp]: { [method: string]: Handler[] } } = {};
	private handlers: HandlerMap = new Map();

	private keys: Map<string, string[]> = new Map();

	public add(method: METHODS, path: string, handler?: Handler) {
		if (!handler) handler = defaultHandler;
		const { keys } = parse(path);

		this.keys.set(path, keys);

		if (!this.handlers.get(path)) this.handlers.set(path, new Map());

		if (!this.handlers.get(path)?.get(method)) {
			// first handler for this path or method
			const oldHandlers: Map<METHODS, Handler> = this.handlers.get(path) || new Map();
			oldHandlers.set(method, handler);
			return;
		}
		// not first handler
		const methodMap = new Map();
		methodMap.set(method, handler);
		this.handlers.set(path, methodMap);
	}

	public async handle(req: Request, res: Response) {
		const { url, method, headers } = req;

		const contentTypeHeader = headers['content-type'];
		if (contentTypeHeader) {
			const contentType = contentTypeHeader.split(';')[0];

			const ALLOWED_CONTENT_TYPES = Object.keys(processedContentTypes);
			if (ALLOWED_CONTENT_TYPES.includes(contentType)) {
				req.body = processedContentTypes[contentType as keyof TProcessedContentTypes](req.body);
			}
		}

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
				handler = this.handlers.get(path)?.get(method as METHODS) || handler;
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
		this.add(METHODS.GET, path, handler);
	}

	public post(path: string, handler?: Handler) {
		this.add(METHODS.POST, path, handler);
	}

	public put(path: string, handler?: Handler) {
		this.add(METHODS.PUT, path, handler);
	}

	public delete(path: string, handler?: Handler) {
		this.add(METHODS.DELETE, path, handler);
	}

	public patch(path: string, handler?: Handler) {
		this.add(METHODS.PATCH, path, handler);
	}

	public options(path: string, handler?: Handler) {
		this.add(METHODS.OPTIONS, path, handler);
	}

	public head(path: string, handler?: Handler) {
		this.add(METHODS.HEAD, path, handler);
	}

	public connect(path: string, handler?: Handler) {
		this.add(METHODS.CONNECT, path, handler);
	}

	public trace(path: string, handler?: Handler) {
		this.add(METHODS.TRACE, path, handler);
	}
}
