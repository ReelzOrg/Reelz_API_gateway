export interface NodeStatus {
	_id: string;
	internalIp: string;
	wsUrl: string;
	publicIp: string;
	cpuLoad: number;
	activeRouters: number;
	lastActive: string;
};