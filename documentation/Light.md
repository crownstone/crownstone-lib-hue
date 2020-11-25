# Documentation - Light
## Overview
 - [Crownstone Hue](/documentation/CrownstoneHue.md)
 - [Discovery](/documentation/Discovery.md)
 - [Bridge](/documentation/Bridge.md)
 - **Light** 
   - [Constructing](#constructing)
   - [Initialization](#initialization)
   - [Polling/Renew state](#pollingrenew-state)
   - [Setting the callback for a lightstate change](#settings-the-callback-for-a-lightstate-change)
   - [Setting a new light state](#setting-a-new-light-state)
   - [Retrieving the current known state](#retrieving-the-current-known-state)
   - [Cleanup](#cleanup)
   - [Getters](#getters) 
 - [Errors](/documentation/Errors.md)
 - [Event calls](/documentation/EventCalls.md)  

## About
The Light object represents a single Philips Hue Light and is dependent on a Bridge object for the usage of its api.


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
        capabilities: light.capabilities.control,
        supportedStates: light.getSupportedStates(),
        api: this._useApi.bind(this)
      })
```
### Initialization
To initialize a light, call:

`light.init()`

This will start the polling of the light every 500ms, checking if the light's state has changed.
The polling rate is defined in [HueConstants.ts](/src/constants/HueConstants.ts) as `LIGHT_POLLING_RATE`

### Polling/Renew state
To renew the light's state, call:

`await light.renewState()` 

This is automatically done every 500ms when the light object is initialized.

It obtains the latest lightstate of the actual Philips Hue Light and when there is a state difference, the new state will be passed with the defined callback. The data passed is of type `HueFullState`.

If the light's state didn't change but its reachability is changed, it will send out an event with topic `onLightReachabilityChange` with a stringified object as `{uniqueId:string,reachable:boolean}`.

### Setting the callback for a light state change
To set the callback for when there is a light state change, call: 

`light.setStateUpdateCallback(callback)`

In the module a callback to the aggregator is used, passing the new state. 

### Setting a new light state
To set the state of the actual Philips Hue Light, call:

`await light.setState(state: StateUpdate)`

The `state` variable is an object supporting the following fields: 
 - on: boolean - Represents if the light should be on or off
 - bri: number -  Represents the brightness and has a range between `1` and `254`
 - hue: number -  Represents the hue of the light and has a range between `0` and `65535`
 - sat: number - Represents the saturation of the light and has a range between `0` and `254`
 - xy: [number, number] - Represents the x and y coordinates of a color in CIE color space and has a range between `[0.0, 0.0]` and `[1.0, 1.0]` 
 - ct: number - Represents the Mired colour temperature and has a range between `153` and `500`
 - effect: string - Can be `“none”` or `“colorloop”`, When using `"colorloop"` it fades through all hues using the current saturation and brightness settings. It keeps going until `"none"` is given.
 - alert: string - Represents an alert animation and supports the following: `"none"` the light is not performing an alert effect, `"select"`the light performs one breathe cycle or `"lselect"` the light performs a breathe cycles for 15 seconds or until an `"alert": "none"` command is received.
 - transitiontime: number - Represents the duration of the transition between the current and new state, with steps of 100ms per number, defaults to 4 (400ms).

Note when on is false, it can't change any other states when done so it throws an error. 
When exceeding the maximum or minimum values of a field, the maximum or minimum will be used instead.
 
**Example:**

Turning the light on with a brightness of 254 and a hue of 12555.

`await light.setState({on:true,bri:254, hue:12555})`
 
### Retrieving the current known state
To retrieve the current known state, call:

`light.getState()`
This will return the state as a HueFullLightState object as format:
```
{
  on: boolean , 
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
Depending on the type of light, the fields can vary because a multiple colour light has more options than a single colour light.


### Cleanup
To stop the interval, call:

`light.cleanup()`
Which will stop the polling.


### Getters
`isReachable():boolean` - Returns if the light is reachable or not. (Might have a slight delay as it depends on actual Bridge providing this data after a poll) 

`getInfo():lightInfo` - Returns all information fields of the light.

`getSupportedStates():[]` - Returns an array of supported states