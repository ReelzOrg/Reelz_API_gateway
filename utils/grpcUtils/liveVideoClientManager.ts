import * as grpc from "@grpc/grpc-js";
import { LiveVideoServiceClient } from "../../generated/lvideo/v1/live_video.js";
import logger from "../logger.js";

export default class LiveVideoClientManager {
	//Singleton pattern
	private static instance: LiveVideoClientManager;

	// Cache to store open connections: Key = "host:port", Value = Client
	// Keeping the gRPC connections open is much cheaper than creating new ones for each client request
	private clients: Map<string, LiveVideoServiceClient> = new Map();

	private constructor() { }

	public static getInstance(): LiveVideoClientManager {
		if (!LiveVideoClientManager.instance) {
			LiveVideoClientManager.instance = new LiveVideoClientManager();
		}
		return LiveVideoClientManager.instance;
	}

	public getClient(host: string, port: number, config?: any): LiveVideoServiceClient {
		const key = `${host}:${port}`;
		// Cache hit
		if (this.clients.has(key)) {
			return this.clients.get(key) as LiveVideoServiceClient;
		}

		// Cache miss
		if (this.clients.size >= config.MAX_INSTANCE_COUNT) {
			logger.error(`[Gateway Client] Max client instances reached: ${this.clients.size}`);
			throw new Error(`Max client instances reached: ${this.clients.size}`);
		}

		const newClient = new LiveVideoServiceClient(
			`${host}:${port}`,
			grpc.credentials.createInsecure(),
			config ?? {
				// Optimization: Keep connection alive even if idle
				'grpc.keepalive_time_ms': config?.KEEP_ALIVE_TIME_MS || 30000,
				'grpc.keepalive_timeout_ms': config?.KEEP_ALIVE_TIMEOUT_MS || 10000,
				'grpc.keepalive_permit_without_calls': config?.KEEP_ALIVE_PERMIT_WITHOUT_CALLS || 1
			}
		);
		this.clients.set(key, newClient);
		logger.info(`[Gateway Client] Created new client for ${key}`);
		return newClient;
	}

	public closeClient(host: string, port: number): void {
		const key = `${host}:${port}`;
		const client = this.clients.get(key);
		if (client) {
			client.close();
			this.clients.delete(key);
			logger.info(`Closed gRPC client for ${key}`);
		}
	}
}