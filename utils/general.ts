import 'dotenv/config.js'
import logger from './logger.js';

export function verifyEmail(email: string): boolean {
	const regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

	return regex.test(String(email).toLowerCase());
}

/**
 * Use this function instead of process.env.<env_variable> for proper type checking in typescript
 * @param key The Key as present in the env file
 * @param defaultValue A default value to return if the key is not found
 * @returns The value of the env variable (or default value if key not present)
 */
export function requiredEnv(key: string, defaultValue: string): string {
	const value = process.env[key];
	if (!value) {
		logger.error(`Missing required env var: ${key} returning default value: ${defaultValue}`);
		return defaultValue;
		// throw new Error(`Missing required env var: ${key}`);
	}
	return value;
}