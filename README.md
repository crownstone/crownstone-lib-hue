# Crownstone Hue module
This is module incorporates the Philips Hue Bridges and Lights and is compatible to send info to the Crownstone Hue Behaviour Aggregator.
# Work in Progress
Module is still a W.I.P., thus imports aren't correctly specified yet and some parts are prone to change.

## Documentation
### Overview 
 - [Crownstone Hue](/documentation/CrownstoneHue.md) 
 - [Discovery](/documentation/Discovery.md)
 - [Bridge](/documentation/Bridge.md)
 - [Light](/documentation/Light.md)
 - [Errors](/documentation/Errors.md)
 - [Event calls](/documentation/EventCalls.md) 

### Installation

### Import
```import {CrownstoneHue,Discovery} from {crownstone-lib-hue}```

### Usage 
#### Getting Started 
To get started with the module, construct the CrownstoneHue class. This can be done as followed:
```
const crownstoneHue = new CrownstoneHue()   
```

**With already known information**

If you know all the information needed or certain parts of it, you simply can call:
```
await crownstoneHue.addBridge({  
                                name: "Philips Hue Bridge";  // can be empty
                                username: "srfg3AvdD8E550G74B"; // can be empty
                                clientKey: "F713C35839453184BA3B148E5504C74B";  // can be empty
                                macAddress: 00:17:xx:xx:xx:xx;  // can be empty
                                ipAddress: "192.168...";  // can be empty but not together with bridgeId
                                bridgeId: "0017xxFFFExxxxxxx";  // can be empty  but not together with ipAddress
                              });

await crownstoneHue.addLight({id:0,uniqueId:"15:52:xx....", bridgeId:"0017..."}) 
```
Note that, if username is not provided while adding the bridge, the user needs to press the physical button on the Philips Hue Bridge before adding.

**With no known information**

In case you have no bridge information, use:
``
const bridges = await Discovery.discoverBridges();
``
This will return a list of bridges that are connected in your network.

Next up is adding the bridge to the module.
You can pass the bridge object you obtained from the Discovery by simply calling:
```
await crownstoneHue.addBridge(bridges[0]);
``` 
This returns an initialized Bridge object.
The user should press the physical button on the Philips Hue Bridge before adding.

If you do not have any light information yet, use the Bridge to obtain all the lights.
Call:
``
const lights = await bridge.getAllLightsFromBridge();
``
This returns a list of lights, they are usable but not added to the internal list of the Bridge object.
To add the light to the Bridge, call:
```
const light = await bridge.configureLight(lights[0]);
... or ...
const light = await crownstoneHue.addLight(lights[0]);
```
This returns a usable light once again,
To initialize the bridge's polling, call:
```
await bridge.startPolling();
```
This will poll the Hue bridge for all light info every 500ms and sends it to the lights.
Upon state change it sends a callback, which is set by calling: ``light.setStateUpdateCallback(callback)``.

When the Bridge detects a new light that is added to the actual Hue bridge, it will emit an event called: `newLightOnBridge` with a stringified payload   `{uniqueId:string,id:number,name:string,bridgeId:string}`.

For more information, see [CrownstoneHue](/documentation/CrownstoneHue.md) and [Bridge](/documentation/Bridge.md)

All together:
```
const crownstoneHue = new CrownstoneHue()   
const bridges = await Discovery.discoverBridges();
const bridge = await crownstoneHue.addBridge(bridges[0]);
const lights = await bridge.getAllLightsFromBridge();
const light = await crownstoneHue.addLight(lights[0]);
await brige.startPolling();

```
 


 


 