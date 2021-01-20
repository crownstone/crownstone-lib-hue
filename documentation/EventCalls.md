
# Documentation - Event calls
## Overview
 - [Crownstone Hue](/documentation/CrownstoneHue.md)
 - [Discovery](/documentation/Discovery.md)
 - [Bridge](/documentation/Bridge.md)
 - [Light](/documentation/Light.md)
 - [Behaviour Wrapper](/documentation/BehaviourWrapper.md)
 - [Errors](/documentation/Errors.md)
 - **Event calls** 

## About
The Crownstone Hue module uses some event calls for data transferring.
Meaning you can subscribe to these topics in case you need to catch something.
These topic constants are exported from [EventConstants.ts](/src/constants/EventConstants.ts)
## Import
`import {EventBus} from "."`
## Events
### ON_BRIDGE_PERSISTENCE_UPDATE
When a bridge updates itself, it emits an event call with the topic ```"onBridgeUpdate"``` and a data ```object``` with information about itself. Formatted as:
```
{
name: string,
ipAddress: string, 
macAddress: string, 
username: string, 
clientKey: string, 
bridgeId: string, 
lights: {name: string, id: number, uniqueId: string}[]
}
```  
### LIGHT_STATE_CHANGE
When a light's state is changed, it emits an event call with the topic ``"onLightStateChange"`` with `data` as a stringified `HueFullState` object.

### LIGHT_NAME_CHANGE
When a light's name is changed, it emits an event call with the topic `"onLightNameChange"` with `data` as a stringified object as `{uniqueId: string, name: string}`.

### ON_BRIDGE_CONNECTION_REESTABLISHED
A Bridge object emits this event once when it has reconnected to the Philips Hue Bridge. Topic `onBridgeConnectionReestablished` with `data` the bridge's `bridgeId`.

### ON_BRIDGE_CONNECTION_LOST
A Bridge object emits this event once, when it has lost connection to the Philips Hue Bridge. Topic `onBridgeConnectionLost` with `data` the bridge's `bridgeId`.

### ON_BRIDGE_INFO_UPDATE
A Bridge object emits this event when it has new bridge information after an update. Topic `onBridgeUpdate` with `data` as a stringified data object:`.

### NEW_LIGHT_ON_BRIDGE
A Bridge object emits this event when a new light is found on the Philips Hue Bridge. Topic `newLightOnBridge` with `data` as a stringified data object:`{uniqueId:string,id:number,name:string,bridgeId:string}`.

 