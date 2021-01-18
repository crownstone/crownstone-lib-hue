Why are lights not automatically loaded into the lib?
```
If you do not have any light information yet, use the Bridge to obtain all the lights. Call: const lights = await bridge.getAllLightsFromBridge(); This returns a list of lights, they are usable but not added to the internal list of the Bridge object. To add the light to the Bridge, call:
```

Why is polling not started automatically on initalization of the lib? I understand the stop() method, but why does the user have to start this, essentially internal, operation?
```
To initialize the bridge's polling, call:
await bridge.startPolling();
```

When would you add a bridge, but not init it? Similarly, why would init not also start polling?
```
const crownstoneHue = new CrownstoneHue()   
const bridges = await Discovery.discoverBridges();
const bridge = await crownstoneHue.addBridge(bridges[0]);
bridge.init();  // <--- this?
const lights = await bridge.getAllLightsFromBridge();
const light = await crownstoneHue.addLight(Object.values(lights)[0]);
await bridge.startPolling();
```

Try to get the dist folder not to have the root /src. I've done this by adding the rootDir. Double check if everything works.
This is a little cleaner because now the dist folder looks like something you can distribute.

Updated package json to update license. Feel free to add your name as author!

## Documentation:
Multiple getters in light.md. 

Try to use more large headers to improve the documentation structure. The headers (####) are too small compared to the content, making it harder to read. Basically, subract a # everywhere :p

Take the latest changes regarding the light state into account with the rest of the methods getting a state.