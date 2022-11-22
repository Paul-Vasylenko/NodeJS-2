function safeJSON(data: string, fallback: Record<string, string>): Record<string, string> {
	try {
		return JSON.parse(data);
	} catch {
		return fallback;
	}
}

export { safeJSON };
