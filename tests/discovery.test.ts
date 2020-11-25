import { Discovery} from "../src";
import {discovery} from "node-hue-api/lib/v3";
jest.mock('node-fetch');
import fetch from 'node-fetch';
const {Response} = jest.requireActual('node-fetch');


test('Discover Bridge by Id', async () => {
  fetch.mockReturnValue(Promise.resolve(new Response('[{"id":"111744fffe123af4", "internalipaddress":"192.168.178.10"}]')));
  return Discovery.discoverBridgeById("111744fffe123af4")
    .then((bridge)=>{expect(bridge)
      .toStrictEqual({id:"111744fffe123af4", internalipaddress:"192.168.178.10"})})
});

test('Discover Bridges through API', async () => {
  discovery.nupnpSearch = jest.fn(()=>{return [{name:"Test Bridge", ipaddress:"192.168.178.10"}]})
  return Discovery.discoverBridges().then(bridges => {return bridges[0]}).then(bridge => expect(bridge.name).toBe("Test Bridge"));
});

test('Discover Bridges through API, no bridges', async () => {
  discovery.nupnpSearch = jest.fn(()=>{return []})
  return Discovery.discoverBridges().then(bridges => expect(bridges).toStrictEqual([]));
});

test("Discover bridges through url",async () =>{
  fetch.mockReturnValue(Promise.resolve(new Response('[{"id":"111744fffe123af4", "internalipaddress":"192.168.178.10"}]')));
  return Discovery.getBridgesFromDiscoveryUrl().then(bridges => expect(bridges[0].internalipaddress).toBe("192.168.178.10"))
})

test("Discover Bridge by Id, no bridges",async () =>{
  fetch.mockReturnValue(Promise.resolve(new Response('[]')));
  return Discovery.discoverBridgeById("111744fffe123af4")
    .then((bridge)=>{expect(bridge)
      .toStrictEqual({id:"111744fffe123af4", internalipaddress:"-1"})})
})

test("Discover Bridge by Id, wrong bridge",async () =>{
  fetch.mockReturnValue(Promise.resolve(new Response('[{"id":"111744fffe123af4", "internalipaddress":"192.168.178.10"}]')));
  return Discovery.discoverBridgeById("123688fffe292af4")
    .then((bridge)=>{expect(bridge)
      .toStrictEqual({id:"123688fffe292af4", internalipaddress:"-1"})})
})