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
- [Behaviour Wrapper](/documentation/BehaviourWrapper.md)
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

The most important parts of the format are the username, bridge id and ip address as the bridge object relies on these and will attempt to find them itself if any or a combination of those are missing.
When there is/are...
 - Username present: The bridge will be initialized.
 - No username present: The bridge's linking procedure has to be started, press the physical link button and call `await bridge.link()`
   If link button is not pressed, the bridge will throw an error with ``errorCode`` `406`. 
 - No ip address: The bridge's (re)discovery procedure will be started and it tries to find an ip address linked to the bridge id.
 - No bridge id: The bridge has 1 attempt to find the bridge id with the given ip address, in case of failure: the bridge throws an `errorCode` `408`.
 - No bridge id and no ip address, the function will throw `errorCode` `413`, because it cannot initialize without both.
 
### Initialization
Note that the initialization is done by the CrownstoneHue class upon adding a bridge and this section is only for information purposes.

Before using, the bridge should be initialized else it will throw errors on the usage of the Hue API related parts.

This is done by calling:

```
await bridge.init();
```
If a username was present, see [connecting](#connecting)

If no username is present, an unauthenticated api created.  
On success `bridge.reachable` is set to `true` and it's ready for linking.

#### Linking
Upon initialization with an empty username, `await bridge.link(appName,deviceName)` has to be called.
Before doing so, the user must press the physical button on the Philips Hue bridge, else an error will be thrown.

This attempts to create a user on the physical Philips Hue Bridge, with an identifier set by the combination of `appName` and `deviceName`. 
The ``appName`` variable allows a string from 0 to 20 characters and `deviceName` allows a string from 0 to 19 characters. These variables are used as identification for the username on the Philips Hue Bridge's whitelist.

On success, a user is created on the Philips Hue Bridge and the bridge will update itself with the new `username` and `clientkey`.

#### Connecting

If the username is set after linking or upon initialization, the bridge calls `_connect()`, this attempts to create an authenticated api.

On success `bridge.authenticated` and `bridge.reachable` are set to `true` and the bridge object is ready to use.

When the username is wrong or denied by the Philips Hue bridge, it will throw an error.

Afterwards it will obtain the latest bridge information, populate the lights list with all the connected lights and start the polling.

### Polling
To obtain the newest state info for the lights, the bridge polls the Philips Hue Api.
Every 1000ms a request is send to the Philips Hue Bridge, this will return the latest light info and passes the data to its respective lights.
If a new light is found on the Philips Hue Bridge, an event named `"newLightOnBridge"` is emitted with a stringified data object: `{uniqueId: string, id: number, name:string,bridgeId: string}`.
This light is also added to the lights list and ready for use.

If you have to stop the polling, you can call:
```
bridge.stopPolling();
```

To start the polling again, call:
```
bridge.startPolling();
```

### Update
This method is mainly used by the bridge itself, but if you have to update the values of the bridge, call:

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
"reachable": boolean,
"isPolling": boolean,
"authenticated": boolean,
"reconnecting": boolean
}
```

`onlyUpdate` is a boolean that is per default false. Meaning that `this.save()` will be called after the fields are updated, with the only exception of when only fields are updated that does not need to be saved (reachable,isPolling, authenticated and reconnecting).

**Example:**

`bridge.update({"ipAddress": "192.168.178.123"})`

### Save

To save the Bridge's current state, call:

`bridge.save()`

This will emit an event with topic `"onBridgeUpdate"` and a stringified data object formatted as:

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

During the period of rediscovering, `bridge.reachable` is set to `false`, `bridge.reconnecting` is set to `true` and all api calls will be ignored and returned with `{"hadConnectionFailure":true}` . 
The bridge will attempt to rediscover indefinitely. An event is send out with topic `"onBridgeConnectionLost"` and as data, the ``bridgeId``.

After a successful discovery it updates the ipaddress to the new ipaddress, `bridge.reachable` is set to `true`, `bridge.reconnecting` is set to `false`, it will return one more time `{"hadConnectionFailure":true}` and an event is send out with topic `"onBridgeConnectionReestablished"` and as data, the ``bridgeId``.

### Getters

`getLightById(uniqueId):Light` Returns a Light object that matches the given uniqueId in the bridge's light list.

`isReachable():boolean` returns a boolean representing if the bridge is reachable or not.

`getLights(): {[uniqueId]:Light}` Returns all lights that are connected to the bridge.

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
lights:  {name: string, id: id, uniqueId: string}[]
}
```

### Remaining functions
`updateBridgeInfo()` - Updates the bridge info with the new info from the Philips Hue Bridge. (Most likely new name, unless macAddress and/or bridgeId are missing as well);
