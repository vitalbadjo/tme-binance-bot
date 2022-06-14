export function getEnv(name: string): string {
	const env = process.env[name]
	if (env) {
		return env
	} else {
		throw new Error(`Please provide ${name} variable in your .env file`)
	}
}
