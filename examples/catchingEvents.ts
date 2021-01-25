import {CrownstoneHue,eventBus} from "./../dist/"
// import {CrownstoneHue,eventBus} from "crownstone-lib-hue"

const crownstoneHue = new CrownstoneHue();

async function setup(): Promise<void> {
  console.log("Setting up bridge...")
  try {
    //Creates a bridge, Replace data with your data.
    const bridge = await crownstoneHue.addBridge({
      name: "Philips Hue Bridge",  // can be empty
      username: "srfg3AvdD8E550G74B", // can be empty.  if empty, link button must be pressed and bridge.link() to be called.
      clientKey: "F7gaa83fafgBA3B148E5504C74B",  // can be empty
      macAddress: "00:17:xx:xx:xx:xx",  // can be empty
      ipAddress: "192.168...", // can be empty but not together with bridgeId
      bridgeId: "0017xxFFFExxxxxxx" // can be empty  but not together with ipAddress
      }
    )
    console.log("Bridge is initialized and ready to use.")
  }
  catch (e) {
    console.log(e);
  }
}

function printState(state): void {
  console.log("******NEW STATE UPDATE******")
  console.log(state)
}

function useEvents() {
  console.log("Play around with the light.")
  console.log("Will print every light state change.")
  //This example catches every state change and prints it.
  eventBus.subscribe("onLightStateChange", (state) => printState(state))
}

setup()
useEvents();
