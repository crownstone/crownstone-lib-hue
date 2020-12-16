import {CrownstoneHue,Discovery} from "../dist/src"
// import {CrownstoneHue,Discovery} from "crownstone-lib-hue"

const crownstoneHue = new CrownstoneHue();

async function setupNewBridge():Promise<void>{
  const bridgesInNetwork = await Discovery.discoverBridges();
  if(bridgesInNetwork.length > 0){
    const bridge = await crownstoneHue.addBridge(bridgesInNetwork[0])
// Make sure the link button is pressed, else it will throw an error.
    try{
      await bridge.init()
      console.log("Bridge is initialized and ready to use.")
      console.log(bridge.getInfo())
    } catch(e){
      console.log(e);
    }
  }
}


setupNewBridge();