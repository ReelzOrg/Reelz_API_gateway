import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import type { Request, Response } from 'express';
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

import type { ProtoGrpcType } from '../../generated/llm_service.js';
import type { LLMRequest } from '../../generated/llm/LLMRequest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROTO_PATH = path.resolve(__dirname, '../../protos/llm_service.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true
});
const llmProtoDescriptor = (grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType).llm;
const client = new llmProtoDescriptor.LLMService('localhost:50051', grpc.credentials.createInsecure());

export async function llmChatClient(req: Request, res: Response) {
	//Do some processing to create the prompt object

	const grpcRequest: LLMRequest = {
		prompt: req.body.prompt,
		model: req.body.model || 'qwen3:4b',
		user_id: req.body.userId,
		session_id: req.body.sessionId || uuidv4(), //Create a UUID if client doesnt send it
		request_id: req.body.requestId || uuidv4()
		// if the user sends the history and the session_id is null then it should result in an error?

		// We are not handling the chat history here, it will be handled in the python server
		// history: req.body.history ? req.body.history.map(msg => ({role: msg.role, content: msg.content})) : []
	};

	// Set up streaming response for the web client
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive',
		'X-Session-ID': grpcRequest.session_id // Send session ID back to client so that it can be used in the next request
	});

	try {
		//we will be getting a streaming response
		const stream = client.LLMChat(grpcRequest);

		stream.on("data", (response: any) => {
			res.write(`data: ${JSON.stringify(response)}\n\n`);
		});

		stream.on('status', (status: grpc.StatusObject) => {
			console.log("Stream status:", status);
			// Optional: Handle status updates from the gRPC connection
		});

		stream.on("end", () => {
			res.end();
			console.log(`[Node.js Gateway] gRPC stream for session ${grpcRequest.session_id} ended.`);
		});

		stream.on("error", (error: Error) => {
			console.error(`[Node.js Gateway] gRPC stream error for session ${grpcRequest.session_id}:`, error);
			res.write(`data: ${JSON.stringify({ error: `LLM service error: ${error.message}` })}\n\n`);
			res.end();
		});
	} catch (error: any) {
		console.error('Error in gRPC stream:', error);
		res.status(500).json({ error: 'Failed to connect to gRPC server' });
	}
}