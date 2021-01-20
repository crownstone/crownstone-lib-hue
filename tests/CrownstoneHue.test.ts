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
describe("Crownstone Hue", () => {
  test("Crownstone Hue adding a bridge", async () => {
    const crownstoneHue = new CrownstoneHue();
    await crownstoneHue.addBridge({
      name: "Philips Hue Fake Bridge",
      username: "FakeUsername",
      clientKey: "FakeKey",
      macAddress: "AB:DC:FA:KE:91",
      ipAddress: "192.168.178.10",
      bridgeId: "ABDCFFFEAKE91"
    })
    crownstoneHue.stop()
    return expect(crownstoneHue.bridges.length).toBe(1);
  })
  test("Crownstone Hue catching duplicate bridges", async () => {
    const crownstoneHue = new CrownstoneHue();
    await crownstoneHue.addBridge({
      name: "Philips Hue Fake Bridge",
      username: "FakeUsername",
      clientKey: "FakeKey",
      macAddress: "AB:DC:FA:KE:91",
      ipAddress: "192.168.178.10",
      bridgeId: "ABDCFFFEAKE91"
    })
    try{
      await crownstoneHue.addBridge({
        name: "Philips Hue Fake Bridge",
        username: "FakeUsername",
        clientKey: "FakeKey",
        macAddress: "AB:DC:FA:KE:91",
        ipAddress: "192.168.178.10",
        bridgeId: "ABDCFFFEAKE91"
      })
      expect(true).toBe(false) // Fail catch.
    }catch(e){
      expect(e.errorCode).toBe(410)
    }
    try{
      await crownstoneHue.addBridge({
        name: "Philips Hue Fake Bridge",
        username: "FakeUsername",
        clientKey: "FakeKey",
        macAddress: "AB:DC:FA:KE:91",
        ipAddress: "192.168.178.10"
      })
      expect(true).toBe(false) // Fail catch.
    }catch(e){
      expect(e.errorCode).toBe(411)
    }
    crownstoneHue.stop()
    return expect(crownstoneHue.bridges.length).toBe(1);
  })

  test("Crownstone Hue catching bridges that can't be initialized", async () => {
    const crownstoneHue = new CrownstoneHue();
    try{
      await crownstoneHue.addBridge({
        name: "Philips Hue Fake Bridge",
        username: "FakeUsername",
        clientKey: "FakeKey",
        macAddress: "AB:DC:FA:KE:91",
        ipAddress: "",
        bridgeId: ""
      })
      expect(true).toBe(false) // Fail catch.
    }catch(e){
      expect(e.errorCode).toBe(413)
    }
    try{
      await crownstoneHue.addBridge({
        name: "Philips Hue Fake Bridge",
        username: "FakeUsername",
        clientKey: "FakeKey",
        macAddress: "AB:DC:FA:KE:91"
      })
      expect(true).toBe(false) // Fail catch.
    }catch(e){
      expect(e.errorCode).toBe(413)
    }
    crownstoneHue.stop()
    return expect(crownstoneHue.bridges.length).toBe(0);
  })


  test("Crownstone Hue removing bridges", async () => {
    const crownstoneHue = new CrownstoneHue();
    await crownstoneHue.addBridge({
      name: "Philips Hue Fake Bridge",
      username: "FakeUsername",
      clientKey: "FakeKey",
      macAddress: "AB:DC:FA:KE:91",
      ipAddress: "192.168.178.10",
      bridgeId: "ABDCFFFEAKE91"
    })
    expect(crownstoneHue.bridges.length).toBe(1);
    await crownstoneHue.removeBridge("ABDCFFFEAKE91");
    crownstoneHue.stop()
    return expect(crownstoneHue.bridges.length).toBe(0);
  })

})


