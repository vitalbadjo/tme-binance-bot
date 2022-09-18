export function getEnv(name: string): string {
	const env = process.env[name]
	if (env) {
		return env
	} else {
		throw new Error(`Please provide ${name} variable in your .env file`)
	}
}

export function retry<T>(
	tryNum: number,
	delay: number,
	thunk: () => Promise<T>,
): Promise<T> {
	return thunk().catch((error) => {
		if (tryNum === 0) {
			throw error
		}
		return delaySec(delay).then(() => retry(tryNum - 1, delay, thunk))
	})
}

export function delaySec(num: number) {
	return new Promise<void>((r) => setTimeout(r, num))
}
