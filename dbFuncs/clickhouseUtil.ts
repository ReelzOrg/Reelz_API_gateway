import 'dotenv/config.js'
import { createClient, type DataFormat } from "@clickhouse/client";
import logger from '../utils/logger.js';
import { requiredEnv } from '../utils/general.js';

// const host = requiredEnv('CLICKHOUSE_HOST', 'localhost');
// const port = requiredEnv('CLICKHOUSE_PORT', '8443');
const database = requiredEnv('CLICKHOUSE_DB', 'default');
const user = requiredEnv('CLICKHOUSE_USER', 'default');
const password = requiredEnv('CLICKHOUSE_PASSWORD', 'default');

const client = createClient({
	host: "http://localhost:8443",
	database: database,
	username: user,
	password: password,
	// auth: {
	// 	username: user,
	// 	password: password,
	// },
});

/**
 * Note - Each insert creates a "part" which consumes resources. It is recommended to bulk insert at least 1 million or more rows
 * at once. You can also enable and use async_insert feature which collects all the inputs and then pushes them at bulk
 * 
 * @param data 
 * @param table 
 * @param format 
 * @returns True if the data was inserted successfully, false otherwise.
 */
export async function insertClickHouse(data: any[], table: string, format: DataFormat = 'JSONEachRow'): Promise<boolean> {
	try {
		await client.insert({
			table: table, //'analytics.events',
			values: data,
			format: format,
		});
		logger.info("Data inserted into ClickHouse successfully.");

		return true;
	} catch (error: any) {
		logger.error("Error inserting data into ClickHouse:", error);
		return false;
	}
}

/**
 * 
 * @param query 
 * @param format 
 * @returns The retrieved data from ClickHouse
 */
export async function queryClickHouse(query: string, format: DataFormat = 'JSONEachRow'): Promise<any> {
	try {
		const result = await client.query({
			query: query,
			format: format,
		});
		logger.info("Data retrieved from ClickHouse successfully.");

		const rows = await result.json();
		return rows;
	} catch (error: any) {
		logger.error("Error retrieving data from ClickHouse:", error);
		return [];
	}
}