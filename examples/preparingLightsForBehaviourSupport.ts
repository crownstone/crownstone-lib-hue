import {CrownstoneHue} from "../dist/src"
import {BehaviourWrapper} from "../dist/src";
const crownstoneHue = new CrownstoneHue();

// Preparing a light for the Behaviour module.
async function prepareForBehaviour(): Promise<void> {
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
    const lights = await bridge[0].getAllLightsFromBridge();
    const light = await crownstoneHue.addLight(Object.values(lights)[0]);
    console.log("Light is set.");

    //Wrapping the light.
    const wrappedLight = new BehaviourWrapper(light);


    //Ready to be setup with the Crownstone-lib-hue-behaviour library.
    //Example:
    //crownstoneHueBehaviour.addDevice(wrappedLight);
    }
  catch (e) {
    console.log(e);
  }
}


prepareForBehaviour();