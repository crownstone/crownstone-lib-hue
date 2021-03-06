jest.mock("node-hue-api/lib/api/Api", jest.fn())
import {eventBus, Light} from "../src";
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
  test('Renew state, new state', async () => {
    const light = new Light({
      name: "Fake light", uniqueId: "1234ABCD", state: {
        "on": true,
        "bri": 140,
        "alert": "select",
        "mode": "homeautomation",
        "reachable": true
      },type: "Dimmable light", id: 0, bridgeId: "aaccdffee22f", capabilities: {}, supportedStates: [], api: mockApi
    })
    await light.renewState();
    expect(light.getCurrentState()).toStrictEqual(fakeState)
  })
  test('Renew state, same state', async () => {
    const light = new Light({
      name: "Fake light", uniqueId: "1234ABCD", state: {
        "on": true,
        "bri": 190,
        "alert": "select",
        "mode": "homeautomation",
        "reachable": true
      },type: "Dimmable light", id: 0, bridgeId: "aaccdffee22f", capabilities: {}, supportedStates: [], api: mockApi
    })
    await light.renewState();
    expect(light.getCurrentState()).toStrictEqual(fakeState)
  })

  test('setState, above max', async () => {
    const light = new Light({
      name: "Fake light", uniqueId: "1234ABCD", state: {
        "on": true,
        "bri": 140,
        "alert": "select",
        "mode": "homeautomation",
        "reachable": true
      },type: "Dimmable light", id: 0, bridgeId: "aaccdffee22f", capabilities: {}, supportedStates: [], api: mockApi
    })
    await light.setState({on: true, bri: 10000});
    expect(light.getTransitionToState()).toMatchObject({
      "on": true,
      "bri": 254
    })
  })
  test('setState, under min', async () => {
    const light = new Light({
      name: "Fake light", uniqueId: "1234ABCD", state: {
        "on": true,
        "bri": 140,
        "alert": "select",
        "mode": "homeautomation",
        "reachable": true
      }, type: "Dimmable light", id: 0, bridgeId: "aaccdffee22f", capabilities: {}, supportedStates: [], api: mockApi
    })
    await light.setState({on: true, bri: -100});
    expect(light.getTransitionToState()).toMatchObject({
      "on": true,
      "bri": 1
    })
  })

  test('Test Min values', () => {
    expect(lightUtil.manipulateMinMaxValueStates({on: true, bri: -100})).toStrictEqual({on: true, bri: 1});
    expect(lightUtil.manipulateMinMaxValueStates({on: true, hue: -52})).toStrictEqual({on: true, hue: 0});
    expect(lightUtil.manipulateMinMaxValueStates({on: true, sat: -52})).toStrictEqual({on: true, sat: 0});
    expect(lightUtil.manipulateMinMaxValueStates({on: true, xy: [-0.2, -0.2]})).toStrictEqual({
      on: true,
      xy: [0.0, 0.0]
    });
    return expect(lightUtil.manipulateMinMaxValueStates({on: true, ct: 4})).toStrictEqual({on: true, ct: 153});
  })


  test('Test Max values', () => {
    expect(lightUtil.manipulateMinMaxValueStates({on: true, bri: 525})).toStrictEqual({on: true, bri: 254});
    expect(lightUtil.manipulateMinMaxValueStates({on: true, hue: 1243414})).toStrictEqual({on: true, hue: 65535});
    expect(lightUtil.manipulateMinMaxValueStates({on: true, sat: 12515})).toStrictEqual({on: true, sat: 254});
    expect(lightUtil.manipulateMinMaxValueStates({on: true, xy: [3, 3]})).toStrictEqual({on: true, xy: [1.0, 1.0]});
    return expect(lightUtil.manipulateMinMaxValueStates({on: true, ct: 12351})).toStrictEqual({on: true, ct: 500});
  })


  test('State update, new states', async () => {
    const light = new Light({
      name: "Fake light", uniqueId: "1234ABCD", state: {
        "on": true,
        "bri": 140,
        "alert": "select",
        "mode": "homeautomation",
        "reachable": true
      }, type: "Dimmable light", id: 0, bridgeId: "aaccdffee22f", capabilities: {}, supportedStates: [], api: mockApi
    })
    await light.update({
      state: {
        on: true,
        bri: 254,
        reachable:true
      }
    });
    expect(light.getLastSentState().bri).toBe(140)
    await light.update({
      state: {
        on: true,
        bri: 254,
        reachable:true
      }
    });
    expect(light.getLastSentState().bri).toBe(254)
  })


  test('State update unequal states, expected states', async () => {
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 20, 10).toString()));
    const light = new Light({
      name: "Fake light", uniqueId: "1234ABCD", state: {
        "on": true,
        "bri": 140,
        "alert": "select",
        "mode": "homeautomation",
        "reachable": true
      },
      type: "Dimmable light", id: 0, bridgeId: "aaccdffee22f", capabilities: {}, supportedStates: [], api: mockApi
    })
    await light.setState({bri: 254, transitiontime: 600});
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 20, 30).toString()));
    light._stateNotEqualCount = 4;
    await light.update({state: {on: true, bri: 178,reachable:true}});
    expect(light.getCurrentState().bri).toBe(178)
  })

  test('Transition check', async () =>{
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 20, 10).toString()));
    const light = new Light({
      name: "Fake light", uniqueId: "1234ABCD", state: {
        "on": true,
        "bri": 140,
        "alert": "select",
        "mode": "homeautomation",
        "reachable": true
      },
      type: "Dimmable light", id: 0, bridgeId: "aaccdffee22f", capabilities: {}, supportedStates: [], api: mockApi
    })
    await light.setState({bri: 254, transitiontime: 60});
    expect(light.inTransition).toBe(true);
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 21, 10).toString()));
    await light.update({state: {on: true, bri: 254,reachable:true}});
    expect(light.inTransition).toBe(true);
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 21, 31).toString()));
    await light.update({state: {on: true, bri: 254,reachable:true}});
    expect(light.inTransition).toBe(false);

  })

  test('Light state change update',async ()=>{
    Date.now = jest.fn(() => Date.parse(new Date(2020, 9, 4, 13, 20, 10).toString()));
    const light = new Light({
      name: "Fake light", uniqueId: "1234ABCD", state: {
        "on": true,
        "bri": 140,
        "alert": "select",
        "mode": "homeautomation",
        "reachable": true
      },
      type: "Dimmable light", id: 0, bridgeId: "aaccdffee22f", capabilities: {}, supportedStates: [], api: mockApi
    })
    await light.setState({bri: 254, transitiontime: 600});
    let eventEmitted = false;
    eventBus.subscribe('onLightStateChange',(data)=>{
      expect(JSON.parse(data)).toStrictEqual({uniqueId:"1234ABCD",state:
      {
        "on": true,
        "bri": 178,
        "alert": "select",
        "mode": "homeautomation",
        "reachable": true
      }})
      eventEmitted = true;
      })

    await light.update({state: {on: true, bri: 178,reachable:true}});
    expect(eventEmitted).toBe(true);
  })



})
