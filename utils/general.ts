import 'dotenv/config.js'
import { TimeUnit, type GlideString } from '@valkey/valkey-glide';

import logger from './logger.js';
import { getValkeyClient } from './valkey/index.js';
import type { NodeStatus } from '../types/valkeyPayloads.js';

const valkeyClient = await getValkeyClient({
	addresses: [
		{
			host: requiredEnv("VALKEY_LIVE_STREAM_HOST", "localhost"),
			port: parseInt(requiredEnv("VALKEY_LIVE_STREAM_PORT", "6379"))
		}
	],
	requestTimeout: 500,
	clientName: "Reelz_Live_Stream"
});

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

/**
 * The server where valkey is running should be on the same network as the media nodes and the gateway (this app)
 * @returns The node with the lowest CPU load or if any node is at less than 30% CPU load
*/
export async function getBestMediaNode() {
	let cursor: GlideString = "0";
	const MATCH_PATTERN = "node:status:*";
	const COUNT_HINT = 1000;
	let bestNode: NodeStatus | undefined;

	try {
		do {
			//result[0] is the cursor
			//result[1] is the array of keys found in this batch
			const result = await valkeyClient?.scan(cursor, { match: MATCH_PATTERN, count: COUNT_HINT })

			cursor = result[0];
			if (result[1].length > 0) {
				const rawNodeStatuses = await valkeyClient?.mget(result[1]);

				if (rawNodeStatuses) {
					const nodeStatuses: NodeStatus[] = rawNodeStatuses
						.map((nodeStatus) => nodeStatus ? JSON.parse(nodeStatus.toString()) as NodeStatus : null)
						.filter((nodeStatus): nodeStatus is NodeStatus => nodeStatus !== null);

					// Sort by Load (Ascending)
					// We want the node with the LOWEST CPU
					nodeStatuses.sort((a, b) => a.cpuLoad - b.cpuLoad);
					bestNode = nodeStatuses[0];

					// If the best node has a CPU load of less than 30%, return it
					// no need to check for other nodes
					if (bestNode?.cpuLoad && bestNode?.cpuLoad < 30) {
						return bestNode;
					}
				}
			}
		} while (cursor !== "0");
		return bestNode;
	} catch (error) {
		logger.error(error);
	}
}

/**
 * @param streamId The ID of the stream
 * @param nodeIp The IP address of the node where the stream is hosted
 * @returns The result of the set operation
 */
export async function setStreamToNode(streamId: string, nodeIp: string) {
	const cachedStream = await valkeyClient?.set(`stream:${streamId}`, nodeIp, { expiry: { type: TimeUnit.Seconds, count: 60 } });
	return cachedStream;
}

/**
 * @param streamId The ID of the stream
 * @returns The IP address of the node where the stream is hosted
 */
export async function getNodeForStream(streamId: string) {
	const nodeIp = await valkeyClient?.get(`stream:${streamId}`);
	return nodeIp;
}