# Crownstone Hue module
This is module incorporates the Philips Hue Bridges and Lights and is compatible to send info to the Crownstone Hue Behaviour Aggregator.

Note that linking of new lights with the Bridge should be done by the Hue App or any other 3rd party app you use.
## Documentation
### Overview 
 - [Crownstone Hue](/documentation/CrownstoneHue.md) 
 - [Discovery](/documentation/Discovery.md)
 - [Bridge](/documentation/Bridge.md)
 - [Light](/documentation/Light.md)
 - [Behaviour Wrapper](/documentation/BehaviourWrapper.md)
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
const bridge = await crownstoneHue.addBridge({  
                                name: "Philips Hue Bridge";  // can be empty
                                username: "srfg3AvdD8E550G74B"; // can be empty
                                clientKey: "F713C35839453184BA3B148E5504C74B";  // can be empty
                                macAddress: 00:17:xx:xx:xx:xx;  // can be empty
                                ipAddress: "192.168...";  // can be empty but not together with bridgeId
                                bridgeId: "0017xxFFFExxxxxxx";  // can be empty  but not together with ipAddress
                              }); 
``` 
Note that, if username is not provided while adding the bridge, the user needs to press the physical button on the Philips Hue Bridge and you'll have to call: ``bridge.link()`` to start the linking method.
If no button is pressed while doing so, an error will be thrown.

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
This returns a Bridge object.
To link the bridge, call:
```
bridge.link();  
``` 

The user should press the physical link button on the Philips Hue Bridge before linking.

To obtain the lights that are connected to the bridge, call:
``
const lights = await bridge.getLights();
``
This returns a list of lights as `{ [uniqueId: string]: Light }`. Its information is kept up to date by the polling of the bridge. 

When done, call ``crownstoneHue.stop()``, this will stop all the polling.
For more information, see [CrownstoneHue](/documentation/CrownstoneHue.md), [Bridge](/documentation/Bridge.md) and [Light](/documentation/Light.md).

All together:
```
const crownstoneHue = new CrownstoneHue()   
const bridges = await Discovery.discoverBridges();
const bridge = await crownstoneHue.addBridge(bridges[0]); 
const lights = await bridge.getLights(); 
```


### Usage with behaviours
To use the library with the crownstone-lib-hue-behaviour library, you need to wrap the light in a behaviour wrapper.
This is done as followed: 
```
import {BehaviourWrapper} from {crownstone-lib-hue}
const wrapper = new BehaviourWrapper(light);
```
Then just simply insert the wrapper into the module.
```
crownstoneHueBehaviour.addDevice(wrapper);
```
See the [crownstone-lib-hue-behaviour](https://github.com/crownstone/crownstone-lib-hue-behaviour) library for more information.
 

 


 