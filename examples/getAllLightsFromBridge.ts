import {CrownstoneHue} from "../dist/src"
// import {CrownstoneHue} from "crownstone-lib-hue"
const crownstoneHue = new CrownstoneHue();

async function setupBridge(): Promise<void> {
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
    console.log(bridge.getInfo())
  }
  catch (e) {
    console.log(e);
  }
}
async function getLights(){
  //For the example, we will get a bridge from the CrownstoneHue class again.
  const bridges = crownstoneHue.getConfiguredBridges()
  if(bridges.length > 0){
    try {
      const lights = await bridges[0].getAllLightsFromBridge();
      console.log(lights);
    }
    catch (e) {
      console.log(e);
    }
  }

}

setupBridge();
getLights();