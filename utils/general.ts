import 'dotenv/config.js'
import logger from './logger.js';

export function verifyEmail(email: string): boolean {
	const regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

	return regex.test(String(email).toLowerCase());
}

export function requiredEnv(key: string, defaultValue: string): string {
	const value = process.env[key];
	if (!value) {
		logger.error(`Missing required env var: ${key} returning default value: ${defaultValue}`);
		return defaultValue;
		// throw new Error(`Missing required env var: ${key}`);
	}
	return value;
}