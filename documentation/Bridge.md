# Documentation - Bridge

## Overview

- [Crownstone Hue](/documentation/CrownstoneHue.md)
- [Discovery](/documentation/Discovery.md)
- **Bridge**
  - [Constructing](#constructing)
  - [Initialization](#initialization)
    - [Linking](#linking)
    - [User creation](#user-creation)
    - [Connecting](#connecting)
  - [Light configuration](#light-configuration)
  - [Removing a light](#removing-a-light)
  - [Polling](#Polling)
  - [Update](#update)
  - [Save](#save)
  - [On connection failure](#on-connection-failure)
  - [Getters](#getters)
  - [Remaining functions](#remaining-functions)
- [Light](/documentation/Light.md)
- [Errors](/documentation/Errors.md)
- [Event calls](/documentation/EventCalls.md) 

## About

The Bridge is an object that represents the Philips Hue Bridge. This object is used to communicate to the actual Philips Hue bridge it represents and the bridge's lights.

## Usage

### Import

`import {Bridge} from {.}`

### Constructing
```
const bridge = new Bridge({
  name?: string,
  username?: string,
  clientKey?: string,
  macAddress?: string,
  ipAddress?: string,
  bridgeId?: string
});
```

Several fields may be left empty on constructing, it will try to gather their information on initialization.  
Note that either `ip address` or `bridge id` have to be set and if the `username` is empty while initializing, the link button should be pressed on the physical bridge.

### Initialization

Before using, the bridge should be initialized else it will throw errors on the usage of the Hue API related parts.

This is done by calling:

```
await bridge.init();
```

#### Linking

Upon initialization with an empty username, `await this.link()` will be called.
This will create an unauthenticated api session for user creation.  

On success `bridge.reachable` is set to `true` and it's ready for user creation.

##### User creation

After an unauthenticated api session is created, `await this.createNewUser()` is called.
This attempts to create a user on the physical Philips Hue Bridge with the identifiers set by `APP_NAME` and `DEVICE_NAME` in the [HueConstants.ts](/src/constants/HueConstants.ts). If the link button on the physical bridge is not pressed during this, it will throw an error.

On success, a user is created on the Philips Hue Bridge and the bridge will update itself with the new `username` and `clientkey`.

#### Connecting

If the username is set after linking or upon initialization, the bridge calls `this.connect()`, this attempts to create an authenticated api session.

On success `bridge.authenticated` and `bridge.reachable` are set to `true` and the bridge object is ready to use.

When the username is wrong or denied by the Philips Hue bridge, it will throw an error.

### Light configuration

To configure a light that is connected to the Philips Bridge, call:

`await bridge.configureLight({id:number,uniqueId:string})` 

`Id` represents the id of the light on the bridge and `uniqueId` represents the light's uniqueId.

On success, it will return an uninitialized Light object.

In case of a wrong id or the uniqueId doesn't match the id used, it attempts to find by uniqueId.
When light is not found it throws an error. 
If the bridge has connection issues, it attempts to redo this operation every 10 seconds.

### Polling
To obtain the newest state info for the lights, you'll have to poll the Philips Hue Bridge.
To do this, call:
```
bridge.startPolling();
```
Every 500ms a request gets send to the Philips Hue Bridge, this will return the latest light info and passes the data to its respective lights.
If a new light is found on the Philips Hue Bridge, an event named `"newLightOnBridge"` is emitted with a stringified data object: `{uniqueId: string, id: number, name:string,bridgeId: string}` 

To stop the polling, call:

```
bridge.stopPolling();
```

### Removing a light

To remove the light from the Bridge object, call:

`bridge.removeLight(uniqueLightId)`

This only removes the light from the object's light list, not from the actual Philips Hue Bridge.

### Update
To update the values of the bridge, call:

`bridge.update(values,onlyUpdate?)`

`values` is an object that supports a single or a combination of the following fields:

```
{
"name": string,
"ipAddress": string,
"username": string,
"clientKey": string,
"macAddress": string,
"bridgeId": string,
"reachable": string,
"authenticated": string,
"reconnecting": string
}
```

`onlyUpdate` is a boolean that is per default false. Meaning that `this.save()` will be called after the fields are updated, with the only exception of when only fields are updated that does not need to be saved (reachable, authenticated and reconnecting).

**Example:**

`bridge.update({"ipAddress": "192.168.178.123"})`

### Save

To save the Bridge's current state, call:

`bridge.save()`

This will emit an event with topic `"onBridgeUpdate"` and a data object formated as:

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

### On connection failure

If the Philips Hue bridge has connection issues, such as it is not reachable or the ip address is set wrong, the bridge object attempts to rediscover the bridge. Note that if the bridge id is not set, the rediscovery will not work and an error is thrown.

During the period of rediscovering, `bridge.reachable` is set to `false`, `bridge.reconnecting` is set to `true` and all api calls will be ignored and returned with `{"hadConnectionFailure":true}` . The bridge will attempt to rediscover indefinitely.

After a successfull discovery it updates the ipaddress to the new ipaddress, `bridge.reachable` is set to `true`, `bridge.reconnecting` is set to `false` and it will return one more time `{"hadConnectionFailure":true}`.

### Getters

`getLightById(uniqueId):Light` Returns a Light object that matches the given uniqueId in the bridge's light list.

`isReachable():boolean` returns a boolean representing if the bridge is reachable or not.

`getConnectedLights(): Light[]` Returns an array with all lights from the bridge's configured light list.

`isReconnecting():boolean` returns a boolean representing if the bridge is reconnecting or not.

`getInfo(): object` Returns all fields as an object:

```
{
name: string,
ipAddress: string,
macAddress: string,
username: string,
clientKey: string,
bridgeId: string,
reachable: boolean,
authenticated: boolean,
reconnecting: boolean,
lights: Light[]
}
```

### Remaining functions
`updateBridgeInfo()` - Updates the bridge info with the new info from the Philips Hue Bridge. (Most likely name and new lights, unless macAddress and/or bridgeId are missing as well);

`getAllLightsFromBridge():Promise<Light[]>` Returns an array with all Light objects that are retrieved from the actual Philips Hue Bridge, corresponding all Hue Lights connected to the Philips Hue Bridge. These Light objects aren't initialized.

`populateLights():Promise<void>` Add all Philips Hue Lights from the Philips Hue Bridge to the bridge's light list. These Light objects aren't initialized.