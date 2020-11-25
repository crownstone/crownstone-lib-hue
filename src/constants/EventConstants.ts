export const ON_BRIDGE_PERSISTENCE_UPDATE = "onBridgeUpdate";
export const ON_BRIDGE_CONNECTION_LOST = "onBridgeConnectionLost";
export const ON_BRIDGE_CONNECTION_REESTABLISHED = "onBridgeConnectionReestablished";
export const ON_LIGHT_REACHABILITY_CHANGE = "onLightReachabilityChange";  // Payload contains a stringified {uniqueId:string,reachable:boolean}
export const NEW_LIGHT_ON_BRIDGE = "newLightOnBridge";  // Payload contains a stringified {uniqueId:string,id:number,name:string,bridgeId:string}