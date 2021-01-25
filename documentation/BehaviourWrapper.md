# Documentation - Behaviour Wrapper
## Overview
 - [Crownstone Hue](/documentation/CrownstoneHue.md)
 - [Discovery](/documentation/Discovery.md)
 - [Bridge](/documentation/Bridge.md)
 - [Light](/documentation/Light.md)
 - **Behaviour Wrapper**
 - [Errors](/documentation/Errors.md)
 - [Event calls](/documentation/EventCalls.md)  

## About
The behaviour wrapper is a conversion layer for using a light with the crownstone-lib-hue-behaviour library. 
It converts and implements all needed functions and objects making it compatible with the library.
## Usage 
```
import {BehaviourWrapper} from {crownstone-lib-hue}
const wrapper = new BehaviourWrapper(light:Light)
``` 

Upon constructing, it is ready to be used with the crownstone-lib-hue-behaviour library

## Functions

``getType():DeviceType`` - Returns a behaviour aggregator compatible device type based on the Light's type. 

``getState():DeviceState`` - Returns the light's state converted in a format supported by the behaviour aggregator

``setStateUpdateCallback(callback: ((state: BehaviourStateUpdate) => void)): void`` -  Sets the callback for state updates

``getUniqueId(): string `` - Returns the unique id of the light.

``async receiveStateUpdate(state: BehaviourStateUpdate): Promise<void> `` - Used for setting the light's state.