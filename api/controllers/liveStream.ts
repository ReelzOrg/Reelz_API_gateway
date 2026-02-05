import type { Request, Response } from "ultimate-express";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import * as grpc from "@grpc/grpc-js";

import { query } from "../../dbFuncs/index.js";
import { getBestMediaNode, getNodeForStream, requiredEnv, setStreamToNode } from "../../utils/general.js";
import { LiveStreamRole, type User } from "../../types/user.js";
import {
	LiveVideoServiceClient,
	CreateRoomRequest,
	CreateRoomResponse,
	BroadcastConfig
} from "../../generated/lvideo/v1/live_video.js";
import LiveVideoClientManager from "../../utils/grpcUtils/liveVideoClientManager.js";
import logger from "../../utils/logger.js";

/**
 * Expects the req.body to have the following properties:
 * - enableRecording: boolean
 * @returns 
 */
export async function startStream(req: Request, res: Response) {
	const loggedInUser = req.user?.userId;
	if (!loggedInUser) return res.json({ success: false, message: "User not logged in" });
	const getUser = `SELECT follower_count, is_private, subscription_level FROM users WHERE _id = $1;`
	const userData = await query<User>(getUser, [loggedInUser], "getUser");

	// Is user allowed to start a stream? Make sure to check on the frontend as well
	if (!userData[0] || userData[0].is_private) return res.json({ success: false, message: "A public account is required to start a stream" });
	if (userData[0].follower_count && userData[0].follower_count < 1000)
		return res.json({ success: false, message: "A minimum of 1000 followers is required to start a stream" });

	// TODO: if the user is a premium user then give them better quality

	// fetching the node with the least cpu load
	const bestNode = await getBestMediaNode();
	if (!bestNode) return res.json({ success: false, message: "No available nodes" });

	const streamId = uuidv4();
	// send this token to the client, which then passes it the media node
	const secretToken = jwt.sign(
		{ userId: loggedInUser, streamId, role: LiveStreamRole.BROADCASTER },
		requiredEnv("LIVE_STREAM_SECRET", "bruhWhat"),
		{ expiresIn: "2M" }
	);

	// we need to check the broadcasterId on the media node as well, hence we pass it to the media node
	const request: CreateRoomRequest = {
		streamId,
		broadcasterId: loggedInUser,
		config: {
			enableHls: true,
			enableRecording: req.body.enableRecording || false
		} as BroadcastConfig,
		// tokens will be added in the headers
		// auth: { secretToken } as AuthProperties
	};

	// cache the stream for viewers to join later
	const streamCached = await setStreamToNode(streamId, bestNode.internalIp);
	if (!streamCached) return res.json({ success: false, message: "Failed to cache stream" });

	let response: CreateRoomResponse | undefined;
	let client: LiveVideoServiceClient;
	try {
		const config = {
			MAX_INSTANCE_COUNT: 1000, // about 50kb of RAM is used to keep a client open so this is 1000*50 = 50mb of RAM
			KEEP_ALIVE_TIME_MS: 30000, // send keep alive every 30 seconds
			KEEP_ALIVE_TIMEOUT_MS: 10000, // if no response for 10 seconds, close the connection
			KEEP_ALIVE_PERMIT_WITHOUT_CALLS: 1 // allow keep alive even if there are no calls
		}
		// send a grpc request to the node to prepare the room
		// client is created dynamically based on the best node
		// use grpc.credentials.createSsl to create a secure connection in production
		client = LiveVideoClientManager.getInstance().getClient(bestNode.internalIp, 50051, config);
		// This sends the request to the best node available as calculated above (getBestMediaNode)
		response = await createRoomAsync(client, request, secretToken);
		if (!response) return res.json({ success: false, message: "Failed to create room" });
	} catch (err) {
		const error = err as grpc.ServiceError;
		logger.error(`[Gateway Client] Failed to create room: ${error.message} with code ${error.code}`);
		return res.json({ success: false, message: "Failed to create room" });
	}

	// send the auth token (for the media node to verify) and the connection link
	// send the link to connect to the stream
	return res.json({ ...response, secretToken, streamUrl: `ws://${bestNode.wsUrl}:50051` });
}

export async function joinStream(req: Request, res: Response) {
	// Check if the stream is private and if the user is subscribed to the broadcaster
	// If public then let the user to join without auth

	// Get the streamID from the url
	const { streamId } = req.params;
	if (!streamId) return res.json({ success: false, message: "Stream ID not provided" });

	// Check if the stream exists
	const nodeIp = await getNodeForStream(streamId);
	if (!nodeIp) return res.json({ success: false, message: "Stream not found" });

	// Send the SFU node link to the client
	return res.json({ streamUrl: `ws://${nodeIp}:50051` });
}

async function createRoomAsync(client: LiveVideoServiceClient, request: CreateRoomRequest, jwtToken: string): Promise<CreateRoomResponse> {
	return new Promise((resolve, reject) => {
		const deadline = new Date(Date.now() + 2000);
		const metadata = new grpc.Metadata();

		const requestId = uuidv4();
		metadata.add("x-request-id", requestId);
		//remove the authorization token from the request body and the proto file.
		metadata.add("Authorization", `Bearer ${jwtToken}`);

		client.createRoom(request, metadata, { deadline }, (err: grpc.ServiceError | null, resp: CreateRoomResponse) => {
			if (err) {
				if (err.code === grpc.status.DEADLINE_EXCEEDED) {
					logger.error(`[Gateway Client] Failed to create room for request ${requestId}: Deadline exceeded`);
				}
				logger.error(`[Gateway Client] Failed to create room for request ${requestId}: ${err.message}`);
				return reject(err);
			}
			resolve(resp);
		})
	})
}