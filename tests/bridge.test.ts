/**
 * @jest-environment node
 */

import {CrownstoneHue, CrownstoneHueError, Discovery} from "../src";
import {v3} from "node-hue-api"
import {Bridge} from "../src";
import {fakeCreateLocal} from "./helpers/mockHueApi";

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
    return expect(bridge.getInfo()).toStrictEqual({
      name: "Philips Hue Fake Bridge",
      ipAddress: "192.168.178.10",
      macAddress: "AB:DC:FA:KE:91",
      username: "FakeUsername",
      clientKey: "FakeKey",
      bridgeId: "ABDCFFFEAKE91",
      reconnecting: false,
      lights: {},
      authenticated: true,
      reachable: true
    });
  });

  test('getAllLightsFromBridge', async () => {
    const bridge = new Bridge({
      name: "Philips Hue Fake Bridge",
      username: "FakeUsername",
      clientKey: "FakeKey",
      macAddress: "AB:DC:FA:KE:91",
      ipAddress: "192.168.178.10",
      bridgeId: "ABDCFFFEAKE91"
    })
    await bridge.init();
    return bridge.getAllLightsFromBridge().then(lights => expect(Object.values(lights)[0].name).toBe("Light 1"))
  })

  test('Configure light by Id', async () => {
    const bridge = new Bridge({
      name: "Philips Hue Fake Bridge",
      username: "FakeUsername",
      clientKey: "FakeKey",
      macAddress: "AB:DC:FA:KE:91",
      ipAddress: "192.168.178.10",
      bridgeId: "ABDCFFFEAKE91"
    })
    await bridge.init();
    await bridge.configureLight({id: 0, uniqueId: "ABCD123"}).then(light => {
      expect(light.uniqueId).toBe("ABCD123")
    })
  })

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
    await bridge.populateLights();
    return expect(Object.keys(bridge.getConnectedLights()).length).toBe(2);
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
    await bridge.configureLight({id: 0, uniqueId: "ABCD123"})
    return expect(bridge.getLightById("ABCD123").name).toBe("Light 1")
  })
  test('Remove light by Id', async () => {
    const bridge = new Bridge({
      name: "Philips Hue Fake Bridge",
      username: "FakeUsername",
      clientKey: "FakeKey",
      macAddress: "AB:DC:FA:KE:91",
      ipAddress: "192.168.178.10",
      bridgeId: "ABDCFFFEAKE91"
    })
    await bridge.init();
    await bridge.configureLight({id: 0, uniqueId: "ABCD123"})
    expect(bridge.getLightById("ABCD123").name).toBe("Light 1")
    await bridge.removeLight("ABCD123");
    expect(Object.keys(bridge.getConnectedLights()).length).toBe(0);
  })
  test('Configure wrong light', async () => {
    const bridge = new Bridge({
      name: "Philips Hue Fake Bridge",
      username: "FakeUsername",
      clientKey: "FakeKey",
      macAddress: "AB:DC:FA:KE:91",
      ipAddress: "192.168.178.10",
      bridgeId: "ABDCFFFEAKE91"
    })
    await bridge.init();
    try{
      await bridge.configureLight({id: 0, uniqueId: "ADF"})
      expect(true).toBe(false) // Fail catch.
    }catch(e){
      expect(e.errorCode).toBe(422)
    }
  })

  test('Configure wrong light id', async () => {
    const bridge = new Bridge({
      name: "Philips Hue Fake Bridge",
      username: "FakeUsername",
      clientKey: "FakeKey",
      macAddress: "AB:DC:FA:KE:91",
      ipAddress: "192.168.178.10",
      bridgeId: "ABDCFFFEAKE91"
    })
    await bridge.init();
    await bridge.configureLight({id: 51, uniqueId: "ABCD123"}).then(light => {
      expect(light.uniqueId).toBe("ABCD123")
    })
  })

  test("Bridge catching duplicate lights", async () => {
    const bridge = new Bridge({
      name: "Philips Hue Fake Bridge",
      username: "FakeUsername",
      clientKey: "FakeKey",
      macAddress: "AB:DC:FA:KE:91",
      ipAddress: "192.168.178.10",
      bridgeId: "ABDCFFFEAKE91"
    })

    await bridge.init();
    await bridge.configureLight({id:0, uniqueId:"ABCD123"})
    try{
      await bridge.configureLight({id:0, uniqueId:"ABCD123"})
      expect(true).toBe(false); // Failsafe.

    } catch(e){
      expect(e.errorCode).toBe(409);
      expect(e.description).toBe("ABCD123");
    }
  })
})


