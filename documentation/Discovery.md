# Documentation - Discovery

## Overview

- [Crownstone Hue](/documentation/CrownstoneHue.md)
- **Discovery** 
	- [Discover all bridges in the network](#discover-all-bridges-in-the-network) 
	- [Discovering a bridge by Id](#discovering-a-bridge-by-id)
- [Light](/documentation/Light.md)
- [Errors](/documentation/Errors.md)
- [Event calls](/documentation/EventCalls.md)  

## About

The Discovery is a set of utility functions for discovering Philips Hue Bridges in the user's local network. Note that the Bridge has to be connected and reachable from outside the network, as all the discovery functions use (indirectly) the Discovery API that is provided by Philips Hue.

## Usage

### Import

`import {Discovery} from {.}`

### Discovering all bridges in the network

The Discovery utility provides the following:

`await Discovery.discoverBridges()`

On success, it returns an array of uninitialized Bridges with its name and IP Address set.

If no Bridges are found or the Discovery API is unreachable, it returns an empty array.

`await Discovery.getBridgesFromDiscoveryUrl()`
Returns an array of objects formated as `{id:string,internalipaddress:string}`

### Discovering a bridge by Id.

To discovery a bridge by Id, call:

`await Discovery.discoverBridgeById(bridgeId)`

On succes it returns the bridge id and a (new) ip address in an object formated as `{id:string,internalipaddress:string}`.

If the bridge cannot be found, it returns its bridge id along with an internalipaddress set as `"-1"`.