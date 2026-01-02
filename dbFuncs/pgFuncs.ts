import 'dotenv/config.js'
import pgsql, { type QueryResultRow } from 'pg';
import logger from '../utils/logger.js';

//https://node-postgres.com/guides/pool-sizing
const pool = new pgsql.Pool({
	user: process.env.POSTGRES_USER,
	host: process.env.POSTGRES_HOST,
	database: process.env.POSTGRES_DB,
	password: process.env.POSTGRES_PASSWORD,
	port: parseInt(process.env.POSTGRES_PORT || "5432"), // Default PostgreSQL port
});

pool.on("connect", () => {
	logger.info("PostgreSQL connection pool connected.")
	// console.log("PostgreSQL connection pool connected.");
});

pool.on("error", (err: any) => {
	logger.error(`PostgreSQL connection pool error: ${err}`);
	// console.error("PostgreSQL connection pool error:", err);
});

/**
 * Execute a raw SQL query with parameters. User this function for complex queries
 * @param queryStr - Raw SQL Query
 * @param params - Query parameters
 * @param name - Name of the query - for debugging
 * @returns Query result
 */
export async function query<T extends QueryResultRow>(queryStr: string, params?: any[], name = "default"): Promise<T[]> {
	try {
		const start = Date.now();
		const result = await pool.query(queryStr, params);
		const duration = Date.now() - start;
		// console.log(`Query ${name} executed in ${duration}ms`);
		logger.info(`Query ${name} executed in ${duration}ms`);
		return result.rows;
	} catch (err) {
		// console.error(`Database query error(${name}):`, err);
		logger.error(`Database query error(${name}): ${err}`);
		return [];
	}
}

/**
 * Closes the PostgreSQL connection pool
 */
export async function closePool() {
	try {
		await pool.end();
		// console.success("PostgreSQL connection pool closed.");
		logger.info("PostgreSQL connection pool closed.");
	} catch (err) {
		// console.error("Error closing pool:", error);
		logger.error(`Error closing pool: ${err}`);
	}
};

/**
 * Makes a transaction queries to execute multiple queries at the same time
 * @param callback - An async function that receives the client and executes the specific queries
 * @returns The result returned by the callback function, or undefined if an error occurs
 */
export async function transactionQuery<T>(callback: (client: pgsql.PoolClient) => Promise<T>): Promise<T | undefined> {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');
		const result = await callback(client);
		await client.query('COMMIT');
		return result;
	} catch (err) {
		await client.query('ROLLBACK');
		// console.log("There was ana error in the transaction", error);
		logger.error(`There was ana error in the transaction: ${err}`);
		throw err; // Re-throw the error so the caller can handle it (e.g., send error response)
	} finally {
		client.release();
	}
}