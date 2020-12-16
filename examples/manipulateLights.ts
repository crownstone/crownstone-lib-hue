import {CrownstoneHue} from "../dist/src"
const crownstoneHue = new CrownstoneHue();

async function manipulateLight(): Promise<void> {
  //Creates a bridge, Replace data with your data.
  const bridge = await crownstoneHue.addBridge({
      name: "Philips Hue Bridge",  // can be empty
      username: "srfg3AvdD8E550G74B", // can be empty  if empty, link button must be pressed as it will create an user
      clientKey: "F7gaa83fafgBA3B148E5504C74B",  // can be empty
      macAddress: "00:17:xx:xx:xx:xx",  // can be empty
      ipAddress: "192.168...", // can be empty but not together with bridgeId
      bridgeId: "0017xxFFFExxxxxxx" // can be empty  but not together with ipAddress
    }
  )
  try {
    await bridge.init()
    console.log("Bridge is initialized and ready to use.")
    const lights = await bridge.getAllLightsFromBridge();
    if(Object.values(lights).length > 0){
      const light = Object.values(lights)[0]
      //Two options on adding the light for use, both supports adding directly a light object or a config format.
      // with the bridge object:
      await bridge.configureLight(light)
      // await bridge.configureLight({uniqueId:light.uniqueId,id:light.id})

      // Or with the CrownstoneHue class:
      // await crownstone.addLight(light)
      // await crownstone.addLight({uniqueId:light.uniqueId,id:light.id})
      console.log("Light is ready to use")


      //Switches the light light on/off.
      await light.setState({on:!light.getState().on})

      //Try to play around with: bri:1-254, ct:153-500, hue:0-65535, sat:0-254, xy:[0.0,0.0]-[0.5,0.5]
    }
  }
  catch (e) {
    console.log(e);
  }
}
