import 'dotenv/config'
import { GlideClient } from "@valkey/valkey-glide"
import { requiredEnv } from '../general'

const addresses = [
	{
		host: requiredEnv("VALKEY_HOST", "localhost"),
		port: parseInt(requiredEnv("VALKEY_PORT", "6379"))
	}
]

export const valkeyClient = await GlideClient.createClient({
	addresses: addresses,
	requestTimeout: 500,
	clientName: "valkey_node_standalone_client"
});