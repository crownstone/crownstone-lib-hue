# Documentation - Light
## Overview
 - [Crownstone Hue](/documentation/CrownstoneHue.md)
 - [Discovery](/documentation/Discovery.md)
 - [Bridge](/documentation/Bridge.md)
 - **Light** 
   - [Constructing](#constructing) 
   - [Polling/Renew state](#pollingrenew-state)
   - [Setting a new light state](#setting-a-new-light-state)
   - [Light types and state types](#light-types-and-state-types)
   - [Retrieving a state](#retrieving-a-state) 
     - [Current state](#Current-state) 
     - [Unpredicted / Transition completed states](#unpredicted--transition-completed-states) 
     - [Obtaining a state manually](#obtaining-a-state-manually)  
   - [Getters](#getters) 
 - [Behaviour Wrapper](/documentation/BehaviourWrapper.md)
 - [Errors](/documentation/Errors.md)
 - [Event calls](/documentation/EventCalls.md)  

## About
The Light object represents a single Philips Hue (compatible) Light and is dependent on a Bridge object for the usage of its api.
With this object you are able to obtain the Light's information and manipulate the light.

## Usage
### Import
```import {Light} from {.}```
### Constructing
This should only be constructed from a Bridge. But for documentation purposes, a light is constructed as followed:

`const light = new Light(data:LightInitialization)`

`LightInitialization` is of type 
```
{
  name: string, 
  uniqueId: string, 
  state: HueFullState, 
  id: number, 
  bridgeId: string, 
  type: string, 
  capabilities: object, 
  supportedStates: [], 
  api: any
}
```
`capabilities` and `supportedStates` is only used for extra information and the light object isn't depended on this.

The constructing in the bridge looks something like this:
```
new Light({
        name: light.name,
        uniqueId: light.uniqueid,
        state: light.state,
        id: light.id,
        bridgeId: this.bridgeId,
        type: light.type,
        capabilities: light.capabilities.control,
        supportedStates: light.getSupportedStates(),
        api: this._useApi.bind(this)
      })
```
 
### Polling/Renew state
The polling of a light is done by the Bridge and passes information to the Light object.

If the polling of a Bridge is not activated, you can manually poll a single light, by calling:

`await light.renewState()` 

In both instances it gets the latest light state of the actual Philips Hue Light and updates the Light object's state.

Note that the `renewState()` method forces a callback if the obtained state is not equal with the current known state.

See [Retrieving a state](#retrieving-a-state) for information about obtaining this state information.



### Setting a new light state
To set the state of the actual Philips Hue Light, call:

`await light.setState(state: StateUpdate)`

The `state` variable is an object supporting the following types: 
 - on: boolean - Represents if the light should be on or off
 - bri: number -  Represents the brightness and has a range between `1` and `254`
 - hue: number -  Represents the hue of the light and has a range between `0` and `65535`
 - sat: number - Represents the saturation of the light and has a range between `0` and `254`
 - xy: [number, number] - Represents the x and y coordinates of a color in CIE color space and has a range between `[0.0, 0.0]` and `[1.0, 1.0]` 
 - ct: number - Represents the Mired colour temperature and has a range between `153` and `500`
 - effect: string - Can be `“none”` or `“colorloop”`, When using `"colorloop"` it fades through all hues using the current saturation and brightness settings. It keeps going until `"none"` is given.
 - alert: string - Represents an alert animation and supports the following: `"none"` the light is not performing an alert effect, `"select"`the light performs one breathe cycle or `"lselect"` the light performs a breathe cycles for 15 seconds or until an `"alert": "none"` command is received.
 - transitiontime: number - Represents the duration of the transition between the current and new state, with steps of 100ms per number, defaults to 4 (400ms). (May not be supported by 3rd party lights)

Note:

When a light is turned off and a state update is passed without an `on` value, it will add a ``on: true`` to the state update because a light can't be manipulate when it is off.

When a value is exceeding the maximum or minimum values of a field, the maximum or minimum will be used instead. 

When a light is unreachable it will ignore state updates.

When using xy, a light has a certain color gamut it supports, anything outside this range will be compensated by the Hue light.
 
**Example:**

Turning the light on with a brightness of 254 and a hue of 12555.

`await light.setState({on:true,bri:254, hue:12555})`
 

### Light types and state types
#### On/Off lights / Switchable lights
A light of type ``On/Off light`` has the following state:
```
  on: boolean,  
  alert: string,   
  mode: string,      
  reachable: boolean
```
#### Dimmable lights
A light of type ``Dimmable light`` has the following state:
```
  on: boolean, 
  bri: number,  
  alert: string,   
  mode: string,      
  reachable: boolean
```

#### Color lights & Extended Color lights
A light of type ``Color light`` or ``Extended color light``  has the following state:
```
  on: boolean, 
  bri: number,  
  hue: number,  
  sat: number,  
  xy: [number, number],  
  ct: number,    
  effect: string,  
  alert: string,  
  colormode: string,  
  mode: string,  
  reachable: boolean
```

#### Color temperature lights
A light of type ``Color temperature light`` has the following state:
```
  on: boolean , 
  bri: number,  
  ct: number,    
  alert: string,  
  colormode: string,  
  mode: string,  
  reachable: boolean
```


### Retrieving a state
There are two different state updates passed by the light object: the current light state and 
the state after a transition that is started by the light object or when an unpredicted state is received.

Note: Depending on the type of light, the states can vary in the amount of parameters.

#### Current state
On every state difference including reachability changes, an event is send out. This event has a data object with a format as: 
```
{
    uniqueId:string,
    state:HueFullState   
}
``` 
To subscribe to this event use: ``eventBus.subscribe("onLightStateChange",callback)``  
`uniqueId` represents the `uniqueId` of the Light object.


#### Unpredicted / Transition completed states
To prevent unnecessary state updates being send out, as in state updates that are sent during a transition, a callback can be set for when a state transition is completed, based on if the state is 2 times equal, or when the light receives 3 times unequal states and these are unpredicted. Unpredicted as in these states are send by another application.
This is done by calling:
```
light.setStateUpdateCallback(callback)
``` 
The callback will pass data of type `HueFullState`.

In the module a callback to the aggregator is used for passing the new state. 
 
#### Obtaining a state manually
To get a state manually, you can use one of the following getters:

``getState()`` - Returns the current state in the following formats, if there is no state transition: `{transition: {active: false},state:HueFullState}`
If there is an active transition: `{transition:{active:true,data:{from:HueLightState,to:HueLightState,speed:number},progess:number},state:HueFullState}`

``getCurrentState():HueFullState`` - Returns the last known state, updated by polling the bridge. 

``getLastSentState():HueFullState`` - Returns the last state that is sent to a callback.  
 
``getTransitionToState():HueLightState`` - Returns the last state that the light had to transition to, when a setState command is used or null when it isn't used yet.

``getTransitionFromState():HueLightState`` - Returns the last state that the light had to transition from, when a setState command is used, or null when it isn't used yet.

HueFullState Format:
```
{
  on: boolean, 
  bri?: number,  
  hue?: number,  
  sat?: number,  
  xy?: [number, number],  
  ct?: number,    
  effect?: string,  
  alert?: string,  
  colormode?: string,  
  mode?: string,  
  reachable: boolean
  }
```

HueLightState Format:
```
{
  on: boolean, 
  bri?: number,  
  hue?: number,  
  sat?: number,  
  xy?: [number, number],  
  ct?: number,     
  }
```
 


### Getters
The remaining functions for obtaining information are listed below:

`isReachable():boolean` - Returns if the light is reachable or not. (Might have a slight delay as it depends on actual Bridge providing this data after a poll) 

`getInfo():lightInfo` - Returns `name`, `uniqueId`, current state as `state`, `type`, `bridgeId`, `id`, `supportedStates`, `capabilities` and `lastUpdate`   

`getSupportedStates():[]` - Returns an array of supported states

`getType():LightType` - Returns a light type, this can be either:  `"Dimmable light"`, `"Color light"`, `"Extended color light"`, `"Color temperature light"` or `"On/Off light"`(Probably only 3rd party lights)
