import {BehaviourWrapper} from "../src";

const fakeDimLight = {
  getState: (() => {
    return {on: true, bri: 254}
  }),
  getType: (() => {
    return "Dimmable light"
  }),
  setState: ((state) => {
  }),
  setStateUpdateCallback: ((cb) => {
  })
}
const fakeColorLight = {
  getState: (() => {
    return {on: true, bri: 254, hue: 25232, sat: 253, xy: [0.5, 0.2], ct: 154}
  }),
  getType: (() => {
    return "Extended color light"
  }),
  setState: ((state) => {
  }),
  setStateUpdateCallback: ((cb) => {
  })
}
const fakeTempLight = {
  getState: (() => {
    return {on: true, bri: 254, ct: 154}
  }),
  getType: (() => {
    return "Color temperature light"
  }),
  setState: ((state) => {
  }),
  setStateUpdateCallback: ((cb) => {
  })
}
const fakeSwitchLight = {
  getState: (() => {
    return {on: true}
  }),
  getType: (() => {
    return "On/Off light"
  }),
  setState: ((state) => {
  }),
  setStateUpdateCallback: ((cb) => {
  })
}

describe('Wrapper functions', () => {
  test('Device types', () => {
    const switchWrapper = new BehaviourWrapper(fakeSwitchLight);
    expect(switchWrapper.getDeviceType()).toBe("SWITCHABLE")
    const dimWrapper = new BehaviourWrapper(fakeDimLight);
    expect(dimWrapper.getDeviceType()).toBe("DIMMABLE")
    const colorWrapper = new BehaviourWrapper(fakeColorLight);
    expect(colorWrapper.getDeviceType()).toBe("COLORABLE")
    const temperatureWrapper = new BehaviourWrapper(fakeTempLight);
    expect(temperatureWrapper.getDeviceType()).toBe("COLORABLE_TEMPERATURE")

  })

  describe('Conversion Hue to Behaviour Update Command', () => {
    test('Switchable', () => {
      const switchWrapper = new BehaviourWrapper(fakeSwitchLight);
      expect(switchWrapper._convertToBehaviourFormat({on: true})).toStrictEqual({type: "SWITCH", value: true});
      expect(switchWrapper._convertToBehaviourFormat({on: false})).toStrictEqual({type: "SWITCH", value: false});
    })
    test('Dimmable', () => {
      const dimmingWrapper = new BehaviourWrapper(fakeDimLight);
      expect(dimmingWrapper._convertToBehaviourFormat({on: false, bri: 1})).toStrictEqual({
        type: "SWITCH",
        value: false
      });
      expect(dimmingWrapper._convertToBehaviourFormat({on: true, bri: 203})).toStrictEqual({
        type: "DIMMING",
        value: 80
      });
      expect(dimmingWrapper._convertToBehaviourFormat({on: true, bri: 203})).toStrictEqual({
        type: "SWITCH",
        value: true
      });
    })
    test('Colorable', () => {
      const colorWrapper = new BehaviourWrapper(fakeColorLight);
      expect(colorWrapper._convertToBehaviourFormat({
        on: false,
        bri: 1,
        hue: 2533,
        sat: 254,
        ct: 154
      })).toStrictEqual({type: "SWITCH", value: false});
      expect(colorWrapper._convertToBehaviourFormat({
        on: true,
        bri: 1,
        hue: 2533,
        sat: 254,
        ct: 154
      })).toStrictEqual({type: "SWITCH", value: true});
      expect(colorWrapper._convertToBehaviourFormat({
        on: true,
        bri: 254,
        hue: 2533,
        sat: 254,
        ct: 154
      })).toStrictEqual({type: "COLOR", brightness: 100, hue: 14, saturation: 100});
      expect(colorWrapper._convertToBehaviourFormat({
        on: true,
        bri: 203,
        hue: 2533,
        sat: 254,
        ct: 154
      })).toStrictEqual({type: "COLOR", brightness: 80, hue: 14, saturation: 100});
      expect(colorWrapper._convertToBehaviourFormat({
        on: true,
        bri: 203,
        hue: 5233,
        sat: 254,
        ct: 154
      })).toStrictEqual({type: "COLOR", brightness: 80, hue: 29, saturation: 100});
      expect(colorWrapper._convertToBehaviourFormat({
        on: true,
        bri: 203,
        hue: 5233,
        sat: 254,
        ct: 153
      })).toStrictEqual({type: "COLOR_TEMPERATURE", brightness: 80, temperature: 6536});
    })
    test('Colorable temperature', () => {
      const temperatureWrapper = new BehaviourWrapper(fakeTempLight);
      expect(temperatureWrapper._convertToBehaviourFormat({
        on: true,
        bri: 203,
        ct: 153
      })).toStrictEqual({type: "COLOR_TEMPERATURE", brightness: 80, temperature: 6536});
      expect(temperatureWrapper._convertToBehaviourFormat({
        on: false,
        bri: 203,
        ct: 153
      })).toStrictEqual({type: "SWITCH", value: false});
      expect(temperatureWrapper._convertToBehaviourFormat({on: true, bri: 203, ct: 153})).toStrictEqual({
        type: "SWITCH",
        value: true
      });
    })
  })


  describe('Conversion Behaviour update to Hue', () => {
    const wrapper = new BehaviourWrapper(fakeColorLight);
    test('Switchable', () => {
      expect(wrapper._convertToHue({type: "SWITCH", value: true})).toStrictEqual({on: true});
      expect(wrapper._convertToHue({type: "SWITCH", value: false})).toStrictEqual({on: false});
    })
    test('Dimmable', () => {
      expect(wrapper._convertToHue({type: "DIMMING", value: 0})).toStrictEqual({on: false});
      expect(wrapper._convertToHue({type: "DIMMING", value: 80})).toStrictEqual({on: true, bri: 203});
    })
    test('Colorable', () => {
      expect(wrapper._convertToHue({type: "COLOR", brightness: 80, hue: 200, saturation: 100})).toStrictEqual({
        on: true,
        bri: 203,
        hue: 36408,
        sat: 254
      });
      expect(wrapper._convertToHue({
        type: "COLOR",
        brightness: 0,
        hue: 200,
        saturation: 100
      })).toStrictEqual({on: false});
    })

    test('Colorable temperature', () => {
      expect(wrapper._convertToHue({type: "COLOR_TEMPERATURE", brightness: 80, temperature:4000})).toStrictEqual({
        on: true,
        bri: 203,
        ct:250
      });
      expect(wrapper._convertToHue({type: "COLOR_TEMPERATURE", brightness: 0, temperature:4000})).toStrictEqual({on: false});
    })
  })

  describe('Device states', () => {
    test('Switchable', () => {
      const wrapper = new BehaviourWrapper(fakeSwitchLight);
      expect(wrapper.getState()).toStrictEqual({type:"SWITCHABLE",on: true});
    })
    test('Dimmable', () => {
      const wrapper = new BehaviourWrapper(fakeDimLight);
      expect(wrapper.getState()).toStrictEqual({type:"DIMMABLE",on: true, brightness:100});
    })
    test('Colorable', () => {
      const wrapper = new BehaviourWrapper(fakeColorLight);
      expect(wrapper.getState()).toStrictEqual({type:"COLORABLE",on: true, brightness:100,hue:139,saturation:100,temperature:6494});
    })

    test('Colorable temperature', () => {
      const wrapper = new BehaviourWrapper(fakeTempLight);
      expect(wrapper.getState()).toStrictEqual({type:"COLORABLE_TEMPERATURE",on: true, brightness:100,temperature:6494});
    })
  })

})