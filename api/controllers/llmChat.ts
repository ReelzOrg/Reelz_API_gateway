// Use this command to generate the types
// ./node_modules/.bin/proto-loader-gen-types --keepCase --longs=String --enums=String --defaults --oneofs --grpcLib=@grpc/grpc-js --outDir=generated/ protos/llm_service.proto

import { v4 as uuidv4 } from 'uuid';
import type { Request, Response } from 'ultimate-express';
import grpc from "@grpc/grpc-js";

// TODO: Use generated types instead of @grpc/proto-loader (which reads the proto file on the runtime)
// TODO: Implement the llmChatClient function

export async function llmChatClient() { }

/**
 * Ue this api to send and receive data from the llm_service
 * @param req Standard express request object
 * @param res express response object
 */
// export async function llmChatClient(req: Request, res: Response) {
// 	//Do some processing to create the prompt object

// 	const grpcRequest: LLMChatRequest = {
// 		prompt: req.body.prompt,
// 		model: req.body.model || 'qwen3:4b',
// 		user_id: req.body.userId,
// 		session_id: req.body.sessionId || uuidv4(), //Create a UUID if client doesnt send it
// 		request_id: req.body.requestId || uuidv4()
// 		// if the user sends the history and the session_id is null then it should result in an error?

// 		// We are not handling the chat history here, it will be handled in the python server
// 		// history: req.body.history ? req.body.history.map(msg => ({role: msg.role, content: msg.content})) : []
// 	};

// 	// Set up streaming response for the web client
// 	res.writeHead(200, {
// 		'Content-Type': 'text/event-stream',
// 		'Cache-Control': 'no-cache',
// 		'Connection': 'keep-alive',
// 		'X-Session-ID': grpcRequest.session_id // Send session ID back to client so that it can be used in the next request
// 	});

// 	try {
// 		const stream = client.LLMChat(grpcRequest);

// 		stream.on("data", (response: any) => {
// 			res.write(`data: ${JSON.stringify(response)}\n\n`);
// 		});

// 		stream.on('status', (status: grpc.StatusObject) => {
// 			console.log("Stream status:", status);
// 			// Optional: Handle status updates from the gRPC connection
// 		});

// 		stream.on("end", () => {
// 			res.end();
// 			console.log(`[Node.js Gateway] gRPC stream for session ${grpcRequest.session_id} ended.`);
// 		});

// 		stream.on("error", (error: Error) => {
// 			console.error(`[Node.js Gateway] gRPC stream error for session ${grpcRequest.session_id}:`, error);
// 			res.write(`data: ${JSON.stringify({ error: `LLM service error: ${error.message}` })}\n\n`);
// 			res.end();
// 		});
// 	} catch (error: any) {
// 		console.error('Error in gRPC stream:', error);
// 		res.status(500).json({ error: 'Failed to connect to gRPC server' });
// 	}
// }