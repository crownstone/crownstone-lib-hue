import {CrownstoneHue,BehaviourWrapper} from "../dist"
// import {CrownstoneHue,BehaviourWrapper} from "crownstone-lib-hue"
const crownstoneHue = new CrownstoneHue();

// Preparing a light for the Behaviour module.
async function prepareForBehaviour(): Promise<void> {

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
    const light = Object.values(lights)[0];

    //Wrapping the light.
    const wrappedLight = new BehaviourWrapper(light);


    //Ready to be set up with the Crownstone-lib-hue-behaviour library.
    //Example:
    //crownstoneHueBehaviour.addDevice(wrappedLight);
    }
  catch (e) {
    console.log(e);
  }
}


prepareForBehaviour();