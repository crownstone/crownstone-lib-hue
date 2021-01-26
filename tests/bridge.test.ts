/**
 * @jest-environment node
 */

import {CrownstoneHue, CrownstoneHueError, Discovery, eventBus} from "../src";
import {v3} from "node-hue-api"
import {Bridge} from "../src";
import {fakeCreateLocal, fakeLightsOnBridge} from "./helpers/mockHueApi";
const flushPromises = () => new Promise(setImmediate);

afterEach(() => {
  jest.clearAllMocks()
})
beforeEach(() => {
  v3.api.createLocal = jest.fn().mockImplementation(fakeCreateLocal);
})
describe("Bridge", () => {
  test("Bridge init > Connect", async () => {
    const bridge = new Bridge({
      name: "Philips Hue Fake Bridge",
      username: "FakeUsername",
      clientKey: "FakeKey",
      macAddress: "AB:DC:FA:KE:91",
      ipAddress: "192.168.178.10",
      bridgeId: "ABDCFFFEAKE91"
    })
    await bridge.init();
    bridge.stopPolling();
    return expect(bridge.authenticated).toBeTruthy();
  })

  test("Bridge init > Link", async () => {
    const bridge = new Bridge({
      name: "",
      username: "",
      clientKey: "",
      macAddress: "",
      ipAddress: "192.168.178.10",
      bridgeId: ""
    })
    await bridge.init();
    await bridge.link("crownstone-lib-hue","testSuite");
    bridge.stopPolling();
    return expect(bridge.name).toBe("Philips Hue Fake Bridge");
  })

  test('Returns bridge info', async () => {
    const bridge = new Bridge({
      name: "Philips Hue Fake Bridge",
      username: "FakeUsername",
      clientKey: "FakeKey",
      macAddress: "AB:DC:FA:KE:91",
      ipAddress: "192.168.178.10",
      bridgeId: "ABDCFFFEAKE91"
    })
    await bridge.init();
    bridge.stopPolling();
    return expect(bridge.getInfo()).toMatchObject({
      name: "Philips Hue Fake Bridge",
      ipAddress: "192.168.178.10",
      macAddress: "AB:DC:FA:KE:91",
      username: "FakeUsername",
      clientKey: "FakeKey",
      bridgeId: "ABDCFFFEAKE91",
      reconnecting: false,
      authenticated: true,
      reachable: true
    });
  });


  test('Get all connected lights', async () => {
    const bridge = new Bridge({
      name: "Philips Hue Fake Bridge",
      username: "FakeUsername",
      clientKey: "FakeKey",
      macAddress: "AB:DC:FA:KE:91",
      ipAddress: "192.168.178.10",
      bridgeId: "ABDCFFFEAKE91"
    })
    await bridge.init();
    bridge.stopPolling();
    expect(Object.keys(bridge.getLights())).toStrictEqual( ["ABCD123", "XYZ0987" ]);
  })

  test('Rediscovery', async () => {
    Discovery.discoverBridgeById = jest.fn().mockImplementation((id) => {
      return {bridgeId: "ABDCFFFEAKE91", internalipaddress: "192.168.178.10"}
    })
    const bridge = new Bridge({
      name: "Philips Hue Fake Bridge",
      username: "FakeUsername",
      clientKey: "FakeKey",
      macAddress: "AB:DC:FA:KE:91",
      ipAddress: "192.168.178.26",
      bridgeId: "ABDCFFFEAKE91"
    })
    await bridge.init();
    bridge.stopPolling();
    return expect(bridge.ipAddress).toBe("192.168.178.10");
  })

  test('Get light by Id', async () => {
    const bridge = new Bridge({
      name: "Philips Hue Fake Bridge",
      username: "FakeUsername",
      clientKey: "FakeKey",
      macAddress: "AB:DC:FA:KE:91",
      ipAddress: "192.168.178.10",
      bridgeId: "ABDCFFFEAKE91"
    })
    await bridge.init();
    bridge.stopPolling();
    return expect(bridge.getLightById("ABCD123").name).toBe("Light 1")
  })


  test("Polling", async () => {
    jest.useFakeTimers();
    const bridge = new Bridge({
      name: "Philips Hue Fake Bridge",
      username: "FakeUsername",
      clientKey: "FakeKey",
      macAddress: "AB:DC:FA:KE:91",
      ipAddress: "192.168.178.10",
      bridgeId: "ABDCFFFEAKE91"
    })
    bridge._pollingEvent = jest.fn()
    await bridge.init();
    jest.advanceTimersToNextTimer();
    expect(bridge._pollingEvent).toBeCalledTimes(1);
    bridge.stopPolling()
    jest.advanceTimersToNextTimer();
    expect(bridge._pollingEvent).toBeCalledTimes(1);
    bridge.startPolling()
    jest.advanceTimersToNextTimer();
    expect(bridge._pollingEvent).toBeCalledTimes(2)
    bridge.stopPolling()
    return;
  })

  test("On new light added to Hue Bridge", async () => {
    jest.useFakeTimers();
    const bridge = new Bridge({
      name: "Philips Hue Fake Bridge",
      username: "FakeUsername",
      clientKey: "FakeKey",
      macAddress: "AB:DC:FA:KE:91",
      ipAddress: "192.168.178.10",
      bridgeId: "ABDCFFFEAKE91"
    })
    await bridge.init();
    fakeLightsOnBridge.push({
      name: "Light 3",
      uniqueid: "QWERTY0987",
      state: {
        "on": true,
        "bri": 250,
        "alert": "select",
        "mode": "homeautomation",
        "reachable": true
      },
      id: 2,
      type: "Dimmable light",
      bridgeId: "ABDCFFFEAKE91",
      capabilities: {control: {}},
      getSupportedStates: (() => {
        return {}
      })
    })
    expect(Object.keys(bridge.getLights())).toStrictEqual( ["ABCD123", "XYZ0987" ]);

    await jest.advanceTimersToNextTimer();
    await flushPromises();
    expect(Object.keys(bridge.getLights())).toStrictEqual( ["ABCD123", "XYZ0987", "QWERTY0987" ]);
    bridge.stopPolling()
    return;
  })

})


