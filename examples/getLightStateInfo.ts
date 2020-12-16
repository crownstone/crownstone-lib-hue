import {CrownstoneHue} from "../dist/src"
// import {CrownstoneHue} from "crownstone-lib-hue"
const crownstoneHue = new CrownstoneHue();

async function useCallBack(): Promise<void> {
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
      await bridge.configureLight(light)
      console.log("Light is ready to use")

      bridge.startPolling()
      console.log("Polling started, lights will be up-to-date with any changes.")

      console.log("Play around with the light.")
      console.log("Callback will give unexpected states, these are states that are not set by the light object but for example: the hue app.")
      console.log("If light's state is set by the light object, a callback will be given once transition is done.")
      light.setStateUpdateCallback((state) => printState(state))
    }
  }
  catch (e) {
    console.log(e);
  }
}

function printState(state):void{
  console.log("******NEW STATE UPDATE******")
  console.log(state)
}


useCallBack();