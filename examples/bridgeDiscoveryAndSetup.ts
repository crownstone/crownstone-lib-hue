import {CrownstoneHue, Discovery} from "../dist"
// import {CrownstoneHue,Discovery} from "crownstone-lib-hue"

const crownstoneHue = new CrownstoneHue();

async function setupNewBridge(): Promise<void> {

  try {
    console.log("Discovering bridges...")
    const bridgesInNetwork = await Discovery.discoverBridges();
    console.log("Discovered bridges: ", bridgesInNetwork)
    if (bridgesInNetwork.length > 0) {
      const bridge = await crownstoneHue.addBridge(bridgesInNetwork[0]) //Assuming there is only one bridge in the network.
      // Make sure the link button is pressed, else it will throw an error.
      console.log("Attempting to link bridge...")
      await bridge.link("crownstone-lib-hue","ExampleCode")
      console.log("Bridge is linked and ready to use.")
      console.log(bridge.getInfo())
    }
  }
  catch
    (e)
    {
      console.log(e);
    }
}


setupNewBridge();