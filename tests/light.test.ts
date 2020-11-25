jest.mock("node-hue-api/lib/api/Api", jest.fn())
import {Light} from "../src";
import * as Api from "node-hue-api/lib/api/Api";
import {lightUtil} from "../src/util/LightUtil";

afterEach(() =>{
  jest.clearAllMocks()
})
const fakeState = {"on": true, "bri": 190, "alert": "select", "mode": "homeautomation", "reachable": true}
const mockApi = ((value,extra?) => {
  switch(value){
    case "setLightState":
      return Promise.resolve(true)
    case "getLightState":
      return fakeState
  }
})

describe('Light', () => {
  test('Init', () => {
    jest.useFakeTimers();
    const light = new Light({name:"Fake light", uniqueId:"1234ABCD", state:{
        on: false,
        reachable: false
      }, id:0, bridgeId:"aaccdffee22f", capabilities:{}, supportedStates:[], api:mockApi})
    light.renewState = jest.fn();
    light.init();
    jest.advanceTimersByTime(500);
    expect(light.renewState).toBeCalledTimes(1);
    light.cleanup();
    return;
  })
  test('Renew state, new state', async () => {
    const light = new Light({name:"Fake light", uniqueId:"1234ABCD", state:{
        "on": true,
        "bri": 140,
        "alert": "select",
        "mode": "homeautomation",
        "reachable": true
      },  id:0, bridgeId:"aaccdffee22f", capabilities:{}, supportedStates:[], api:mockApi})
    await light.renewState();
    expect(light.getState()).toStrictEqual(fakeState)
  })
  test('Renew state, same state', async () => {
    const light = new Light({name:"Fake light", uniqueId:"1234ABCD", state:{
        "on": true,
        "bri": 190,
        "alert": "select",
        "mode": "homeautomation",
        "reachable": true
      },  id:0, bridgeId:"aaccdffee22f", capabilities:{}, supportedStates:[], api:mockApi})
    await light.renewState();
    expect(light.getState()).toStrictEqual(fakeState)
  })

  test('setState, above max', async () => {
    const light = new Light({name:"Fake light", uniqueId:"1234ABCD", state:{
        "on": true,
        "bri": 140,
        "alert": "select",
        "mode": "homeautomation",
        "reachable": true
      },  id:0, bridgeId:"aaccdffee22f", capabilities:{}, supportedStates:[], api:mockApi})
    await light.setState({on: true, bri: 10000});
    expect(light.getState()).toStrictEqual({
      "on": true,
      "bri": 254,
      "alert": "select",
      "mode": "homeautomation",
      "reachable": true
    })
  })
  test('setState, under min', async () => {
    const light = new Light({name:"Fake light", uniqueId:"1234ABCD", state:{
        "on": true,
        "bri": 140,
        "alert": "select",
        "mode": "homeautomation",
        "reachable": true
      },  id:0, bridgeId:"aaccdffee22f", capabilities:{}, supportedStates:[], api:mockApi})
    await light.setState({on: true, bri: -100});
    expect(light.getState()).toStrictEqual({
      "on": true,
      "bri": 1,
      "alert": "select",
      "mode": "homeautomation",
      "reachable": true
    })
  })

  test('Test Min values', () => {
    expect(lightUtil.manipulateMinMaxValueStates({on: true, bri: -100})).toStrictEqual({on: true, bri: 1});
    expect(lightUtil.manipulateMinMaxValueStates({on: true, hue: -52})).toStrictEqual({on: true, hue: 0});
    expect(lightUtil.manipulateMinMaxValueStates({on: true, sat: -52})).toStrictEqual({on: true, sat: 0});
    expect(lightUtil.manipulateMinMaxValueStates({on: true, xy: [-0.2, -0.2]})).toStrictEqual({on: true, xy: [0.0,0.0]});
    return expect(lightUtil.manipulateMinMaxValueStates({on: true, ct: 4})).toStrictEqual({on: true, ct: 153 });
  })


  test('Test Max values', () => {
    expect(lightUtil.manipulateMinMaxValueStates({on: true, bri: 525})).toStrictEqual({on: true, bri: 254});
    expect(lightUtil.manipulateMinMaxValueStates({on: true, hue: 1243414})).toStrictEqual({on: true, hue: 65535});
    expect(lightUtil.manipulateMinMaxValueStates({on: true, sat: 12515})).toStrictEqual({on: true, sat: 254});
    expect(lightUtil.manipulateMinMaxValueStates({on: true, xy: [3, 3]})).toStrictEqual({on: true, xy: [1.0,1.0]});
    return expect(lightUtil.manipulateMinMaxValueStates({on: true, ct: 12351})).toStrictEqual({on: true, ct: 500 });
  })


})
