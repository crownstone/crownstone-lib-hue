
# Documentation - Event calls
## Overview
 - [Crownstone Hue](/documentation/CrownstoneHue.md)
 - [Discovery](/documentation/Discovery.md)
 - [Bridge](/documentation/Bridge.md)
 - [Light](/documentation/Light.md)
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
### ON_LIGHT_REACHABILITY_CHANGE
When a light's reachability is changed, it emits an event call with the topic ```"onLightReachabilitychange"``` and a data object as ```{uniqueId:string,reachable:boolean}```.

### ON_BRIDGE_CONNECTION_REESTABLISHED
A Bridge object throws this error once when it has reconnected to the Philips Hue Bridge. Topic `onBridgeConnectionReestablished` with `data` the bridge's `bridgeId`

### ON_BRIDGE_CONNECTION_LOST
A Bridge object throws this error once, when it has lost conenction to the Philips Hue Bridge. Topic `onBridgeConnectionLost` with `data` the bridge's `bridgeId`