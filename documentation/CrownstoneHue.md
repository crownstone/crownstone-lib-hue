# Documentation - Crownstone Hue 
## Overview
 - **Crownstone Hue**
	- [Constructing](#Constructing)
	- [Adding a Philips Hue Bridge](#adding-a-philips-hue-bridge)
	- [Removing a Philips Hue Bridge](#removing-a-philips-hue-bridge)
	- [Stopping the module](#stopping-the-module)
	- [Obtaining Lights and Bridges](#obtaining-lights-and-bridges)
 - [Discovery](/documentation/Discovery.md)
 - [Bridge](/documentation/Bridge.md)
 - [Light](/documentation/Light.md)
 - [Behaviour Wrapper](/documentation/BehaviourWrapper.md)
 - [Errors](/documentation/Errors.md)
 - [Event calls](/documentation/EventCalls.md) 

## About
The Crownstone Hue class is the front of the module. Even though the objects given by it might work fine if you construct them outside the CrownstoneHue class, it is recommendend to use the CrownstoneHue class for creation and removal of Bridges as it has a few extra checks.

## Usage 
### Import
```import {CrownstoneHue} from {.}```
### Constructing

``` 
const crownstoneHue = new CrownstoneHue();
or
const crownstoneHue = new CrownstoneHue();

```  

### Adding a Philips Hue Bridge
To add a bridge to the module, call:
```
await crownstoneHue.addBridge(configFormat:BridgeInitialization);
``` 

The BridgeInitFormat is of format:
```
interface BridgeInitialization {  
  name?: string;  
  username?: string;  
  clientKey?: string;  
  macAddress?: string;  
  ipAddress?: string;  
  bridgeId?: string;  
}
```

Based on the information passed with the format, it will create a bridge.
If any of the keys are missing or undefined, it will use a null on the creation of the object.

The most important parts of the format are the username, bridge id and ip address as the bridge object relies on these and will attempt to find them itself if any or a combination of those are missing.
When there is/are...
 - Username present: The bridge will be initialized.
 - No username present: The bridge's linking procedure has to be started, press the physical link button and call `await bridge.link()`
   If link button is not pressed, the bridge will throw an error with ``errorCode`` `406`. 
 - No ip address: The bridge's (re)discovery procedure will be started and it tries to find an ip address linked to the bridge id.
 - No bridge id: The bridge has 1 attempt to find the bridge id with the given ip address, in case of failure: the bridge throws an `errorCode` `408`.
 - No bridge id and no ip address, the function will throw `errorCode` `413`, because it cannot initialize without both.
 - The bridge corresponding the bridge id given is already configured,  the function will throw `errorCode` `410`.
 - The bridge corresponding the bridge ip address given is already configured,  the function will throw `errorCode` `411`.

Afterwards returns the Bridge object.

Lights are added and kept up-to-date by the bridge itself. 

### Removing a Philips Hue Bridge
To remove a bridge from the module, call:
```
crownstoneHue.removeBridge(bridgeId);
``` 
This will remove the bridge and its lights from the module.

### Stopping the module.
To stop the module, call:
```
crownstoneHue.stop();
```
This will stop all timers and cleanup the eventbus.


### Obtaining Lights and Bridges
There are some extra functions to obtain lights and bridges.

```getAllConnectedLights()```  will return a mapped list as `{[uniqueId: string]: Light}`, `uniqueId` represents the Light's uniqueId.

```getConfiguredBridges()```  will return all bridges that are configured an array. 