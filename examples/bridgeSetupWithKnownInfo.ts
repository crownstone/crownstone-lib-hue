import {CrownstoneHue} from "../dist"
// import {CrownstoneHue} from "crownstone-lib-hue"

const crownstoneHue = new CrownstoneHue();

async function setupBridge(): Promise<void> {

   try {
     //Replace data with your data.
     const bridge = await crownstoneHue.addBridge({
       name: "Philips Hue Bridge",  // can be empty
       username: "srfg3AvdD8E550G74B", // can be empty.  if empty, link button must be pressed and bridge.link() to be called.
       clientKey: "F7gaa83fafgBA3B148E5504C74B",  // can be empty
       macAddress: "00:17:xx:xx:xx:xx",  // can be empty
       ipAddress: "192.168...", // can be empty but not together with bridgeId
       bridgeId: "0017xxFFFExxxxxxx" // can be empty  but not together with ipAddress
     });
    console.log("Bridge is initialized and ready to use.")
    console.log(JSON.stringify(bridge.getInfo(),null,4))
  }
  catch (e) {
    console.log(e);
  }
}


setupBridge();