# Documentation - Errors

## Overview

- [Crownstone Hue](/documentation/CrownstoneHue.md)
- [Discovery](/documentation/Discovery.md)
- [Bridge](/documentation/Bridge.md)
- [Light](/documentation/Light.md)
- [Behaviour Wrapper](/documentation/BehaviourWrapper.md)
- **Errors**
- [Event calls](/documentation/EventCalls.md)  

## About

In case of something happened the module can throw an error, these errors are defined in [CrownstoneHueError.ts](/src/util/CrownstoneHueError.ts) as well as a copy below.

## Errors

The errors are of type CrownstoneHueError and have a `code`, `message` and an optional `description`.
See below for the codes with some extra description for possible reasons.

### Codes

- 401: "Unauthorized user on Bridge." - Cause: The username used for the Philips Hue Bridge is probably wrong.
- 404: "Bridge is unreachable and probably offline."
- 405: "Bridge is not authenticated for this action." - An authenticated api call is made, while the bridge was not authenticated yet.
- 406: "Link button on Bridge is not pressed."
- 407: "Bridge is not initialized." - An api call is done while the Bridge was not initialized yet.
- 408: "Bridge has no Bridge Id and thus cannot be rediscovered."  
- 410: "The given bridge already exists."
- 412: "Something went wrong when trying to configure a light."
- 413: "Bridge cannot be created, neither an ip address nor a bridge id is given."
- 422: "Light is not found on the bridge." - Probably a wrong id used, see the description for the light id.
- 423: "Cannot manipulate light when light is off."
- 424: "Something went wrong with an action call to the Philips Hue Bridge, see description for more information."
- 425: "Given light type is not supported."
- 426: "Api call is missing extra parameters."
- 427: "Given device name is too long, make sure it is between 0 and 19 characters."
- 428: "Given app name is too long, make sure it is between 0 and 20 characters."
- 888: "Unknown action call to Hue Api." - Will be thrown if bridge use api method receives an unknown action string
- 999: "Unknown Error, see description." - This one will most likely be thrown if an error from the external library is not specifically converted and/or something unexpected happened.


 