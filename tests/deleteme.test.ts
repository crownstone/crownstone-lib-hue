import {CrownstoneHue} from "../src";
import {lightUtil} from "../src/util/LightUtil";


function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test("t", async () => {
  const crownstoneHue = new CrownstoneHue();
  const bridge = await crownstoneHue.addBridge({
    "name": "Philips Hue",
    "ipAddress": "192.168.178.26", // Should change itself to the right one
    "macAddress": "00:17:88:29:2a:f4",
    "bridgeId": "001788FFFE292AF4",
    "username": "vaHAgs9ElCehbdZctr71J1Xi3B6FIWIBoYN4yawo",
    "clientKey": "F713C35839453184BA3B148E5504C74B"
  })
  const lights = await bridge.getAllLightsFromBridge();
  const light = await crownstoneHue.addLight(Object.values(lights)[0]);
  // console.log(light.getInfo());

  await light.setState({hue:123*360})
  // await light.setState({hue: 360*44,sat:5 * 2.54,bri:254})
})
let values = []
let values2 = []
let values3 = []
let values4 = []

test("test - hsv", async () => {
  const crownstoneHue = new CrownstoneHue();
  const bridge = await crownstoneHue.addBridge({
    "name": "Philips Hue",
    "ipAddress": "192.168.178.26", // Should change itself to the right one
    "macAddress": "00:17:88:29:2a:f4",
    "bridgeId": "001788FFFE292AF4",
    "username": "vaHAgs9ElCehbdZctr71J1Xi3B6FIWIBoYN4yawo",
    "clientKey": "F713C35839453184BA3B148E5504C74B"
  })
  const lights = await bridge.getAllLightsFromBridge();
  const light = await crownstoneHue.addLight(Object.values(lights)[0]);

  const hueFrom = 10000
  const hueTo = 56531
  const transitionTime = 600*5
  await light.setState({on: true, hue:hueFrom, transitiontime: 1})

  await timeout(10000)
  let startTime = Date.now()
  await light.setState({on: true, hue:hueTo, transitiontime:transitionTime})
  let stop;
  stop = setInterval(async () => {
    await light.renewState()
    if (light.getState().hue !== values[values.length -1])  {
      values.push(light.getState().hue)
      values3.push(light._isStateExpected())
      values2.push(Date.now() - startTime)
    }
    ;

  }, 200)

  await timeout(600*5.5*100)

  console.log(values)
}, 100 * 600 * 15)

test("test - CT", async () => {
  const crownstoneHue = new CrownstoneHue();
  const bridge = await crownstoneHue.addBridge({
    "name": "Philips Hue",
    "ipAddress": "192.168.178.26", // Should change itself to the right one
    "macAddress": "00:17:88:29:2a:f4",
    "bridgeId": "001788FFFE292AF4",
    "username": "vaHAgs9ElCehbdZctr71J1Xi3B6FIWIBoYN4yawo",
    "clientKey": "F713C35839453184BA3B148E5504C74B"
  })
  const lights = await bridge.getAllLightsFromBridge();
  const light = await crownstoneHue.addLight(Object.values(lights)[0]);
  await light.setState({ bri: 1, transitiontime: 0})
  await timeout(2000)
  await light.setState({bri: 254, transitiontime: 50})
  await timeout(1500)
  await light.setState({bri: 1, transitiontime: 50})

  await timeout(66644)

  console.log(values)
}, 100 * 600 * 15)



test('Speed',async ()=>{
  const crownstoneHue = new CrownstoneHue();
  const bridge = await crownstoneHue.addBridge({
    "name": "Philips Hue",
    "ipAddress": "192.168.178.26", // Should change itself to the right one
    "macAddress": "00:17:88:29:2a:f4",
    "bridgeId": "001788FFFE292AF4",
    "username": "vaHAgs9ElCehbdZctr71J1Xi3B6FIWIBoYN4yawo",
    "clientKey": "F713C35839453184BA3B148E5504C74B"
  })
  const lights = await bridge.getAllLightsFromBridge();
  const light = await crownstoneHue.addLight(Object.values(lights)[0]);
  console.time("Duration");
  await light.setState({on: true, bri:254, hue:25000, sat:254, transitiontime:120});
  console.timeEnd("Duration");

});



test('Util',()=>{
  Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 20, 20).toString()));
  console.log(lightUtil.calculateCurrentHue(0,70,200, Date.parse(new Date(2020, 9, 4, 13, 20, 10).toString())))
})