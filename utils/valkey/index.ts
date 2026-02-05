import 'dotenv/config'
import { GlideClient, GlideClientConfiguration } from "@valkey/valkey-glide"
import { requiredEnv } from '../general.js'

const addresses = [
	{
		host: requiredEnv("VALKEY_HOST", "localhost"),
		port: parseInt(requiredEnv("VALKEY_PORT", "6379"))
	}
]

/**
 * 
 * @param config The configuration for the valkey client
 * @returns Returns the standard valkey client or a custom client if config is provided
 */
//Key optional parameter is used here for simplicity
export async function getValkeyClient(config?: GlideClientConfiguration) {
	let valkeyClient;

	if (config) {
		valkeyClient = await GlideClient.createClient(config);
		return valkeyClient;
	}

	valkeyClient = await GlideClient.createClient({
		addresses: addresses,
		requestTimeout: 500,
		clientName: "valkey_node_standalone_client"
	});

	return valkeyClient;
}