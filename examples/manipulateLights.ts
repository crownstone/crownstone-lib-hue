import {CrownstoneHue} from "../dist"
import {eventBus} from "../dist";
// import {CrownstoneHue} from "crownstone-lib-hue"
const crownstoneHue = new CrownstoneHue();

async function manipulateLight(): Promise<void> {
  try {
    //Creates a bridge, Replace data with your data.
    const bridge = await crownstoneHue.addBridge({
      name: "Philips Hue Bridge",  // can be empty
      username: "srfg3AvdD8E550G74B", // can be empty.  if empty, link button must be pressed and bridge.link() to be called.
      clientKey: "F7gaa83fafgBA3B148E5504C74B",  // can be empty
      macAddress: "00:17:xx:xx:xx:xx",  // can be empty
      ipAddress: "192.168...", // can be empty but not together with bridgeId
      bridgeId: "0017xxFFFExxxxxxx" // can be empty  but not together with ipAddress
      })
    console.log("Bridge is initialized and ready to use.")
    const lights = await bridge.getLights();
    if(Object.values(lights).length > 0){
      const light = Object.values(lights)[0]
      console.log("Light is ready to use")
      console.log("Light is currently turned",(light.getCurrentState().on)?"on":"off")
      //Switches the light light on/off.
      await light.setState({on:!light.getCurrentState().on})
      eventBus.subscribe("onLightStateChange",(data)=>{console.log("Light is now turned",(JSON.parse(data).state.on)?"on":"off")
      })
      //Try to play around by adding any of the following parameters: bri:1-254, ct:153-500, hue:0-65535, sat:0-254
    }
  }
  catch (e) {
    console.log(e);
  }
}
manipulateLight()