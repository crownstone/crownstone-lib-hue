import {CrownstoneHue, CrownstoneHueError, Light} from "..";
import {HUE_CONVERSION_VALUE, PERCENTAGE_CONVERSION_VALUE} from "../constants/HueConstants";
import {lightUtil} from "../util/LightUtil";
import {GenericUtil} from "../util/GenericUtil";

export class BehaviourWrapper implements DeviceBehaviourSupport {
  light: Light;
  state: HueFullState
  callback: ((state: BehaviourStateUpdate) => void) = function(state){};

  constructor(light: Light) {
    this.light = light;
    this.state = light.getState();
  }

  async receiveStateUpdate(state: BehaviourStateUpdate): Promise<void> {
    await this.light.setState(this._convertToHue(state));

  }

  setStateUpdateCallback(callback: ((state: BehaviourStateUpdate) => void)): void {
    this.callback = callback;
    this.light.setStateUpdateCallback(this.sendStateToBehaviour.bind(this));
  }

  sendStateToBehaviour(state: HueLightState): void {
    this.callback(this._convertToBehaviourFormat(state));
  }

  getUniqueId(): string {
    return this.light.getUniqueId()
  }

  getDeviceType(): DeviceType {
    switch (this.light.getType()) {
      case "On/Off light":
        return "SWITCHABLE";
      case "Color light":
        return "COLORABLE";
      case "Extended color light":
        return "COLORABLE"
      case "Color temperature light" :
        return "COLORABLE_TEMPERATURE";
      case "Dimmable light":
        return "DIMMABLE";
      default:
        throw new CrownstoneHueError(425)
    }
  }

  getState(): DeviceState {
    switch (this.getDeviceType()) {
      case "SWITCHABLE":
        return {type: "SWITCHABLE", on: this.light.getState().on}
      case "DIMMABLE":
        return {
          type: "DIMMABLE",
          on: this.light.getState().on,
          brightness: Math.round(this.light.getState().bri / PERCENTAGE_CONVERSION_VALUE)
        }
      case "COLORABLE":
        return {
          type: "COLORABLE",
          on: this.light.getState().on,
          brightness:  Math.round(this.light.getState().bri / PERCENTAGE_CONVERSION_VALUE),
          hue:  Math.round(this.light.getState().hue / HUE_CONVERSION_VALUE),
          saturation:  Math.round(this.light.getState().sat / PERCENTAGE_CONVERSION_VALUE),
          temperature: lightUtil.convertTemperature(this.light.getState().ct)
        }
      case "COLORABLE_TEMPERATURE":
        return {
          type: "COLORABLE_TEMPERATURE",
          on: this.light.getState().on,
          brightness:  Math.round(this.light.getState().bri / PERCENTAGE_CONVERSION_VALUE),
          temperature: lightUtil.convertTemperature(this.light.getState().ct),
        }
    }
  }

  _convertToBehaviourFormat(state: HueLightState): BehaviourStateUpdate {
    const oldState = this.state;
    this.state = GenericUtil.deepCopy(state);
    switch (this.getDeviceType()) {
      case "SWITCHABLE":
        return {type: "SWITCH", value: state.on};
      case "DIMMABLE":
        return (state.on && state.bri != oldState.bri) ? {
          type: "DIMMING",
          value: Math.round(state.bri / PERCENTAGE_CONVERSION_VALUE)
        } : (state.on) ? {type: "SWITCH", value: true} : {type: "SWITCH", value: false}
      case "COLORABLE":
        if (state.on) {
          if (state.ct !== oldState.ct) {
            return {
              type: "COLOR_TEMPERATURE",
              brightness: Math.round(state.bri / PERCENTAGE_CONVERSION_VALUE),
              temperature: lightUtil.convertTemperature(state.ct),
            }
          }
          else if (state.bri !== oldState.bri || state.hue !== oldState.hue || state.sat !== oldState.sat) {
            return {
              type: "COLOR",
              brightness: Math.round(state.bri / PERCENTAGE_CONVERSION_VALUE),
              hue: Math.round(state.hue / HUE_CONVERSION_VALUE),
              saturation: Math.round(state.sat / PERCENTAGE_CONVERSION_VALUE)
            }
          }
          else {
            return {type: "SWITCH", value: true}
          }
        }
        else {
          return {type: "SWITCH", value: false};
        }

      case "COLORABLE_TEMPERATURE":
        return ((state.on && (state.bri != oldState.bri || state.ct != oldState.ct))) ? {
          type: "COLOR_TEMPERATURE",
          brightness: Math.round(state.bri / PERCENTAGE_CONVERSION_VALUE),
          temperature: lightUtil.convertTemperature(state.ct),
        } : (state.on) ? {type: "SWITCH", value: true} : {type: "SWITCH", value: false}
    }
  }

  _convertToHue(state: BehaviourStateUpdate): StateUpdate {
    switch (state.type) {
      case "SWITCH":
        return {on: state.value}
      case "DIMMING":
        return (state.value === 0) ? {on: false} : {on: true, bri: Math.round(state.value * PERCENTAGE_CONVERSION_VALUE)}
      case "COLOR":
        return (state.brightness === 0) ? {on: false} : {
          on: true,
          bri: Math.round(state.brightness * PERCENTAGE_CONVERSION_VALUE),
          sat: Math.round(state.saturation * PERCENTAGE_CONVERSION_VALUE),
          hue: Math.round(state.hue * HUE_CONVERSION_VALUE)
        }
      case "COLOR_TEMPERATURE":
        return (state.brightness === 0) ? {on: false} : {
          on: true,
          bri: Math.round(state.brightness * PERCENTAGE_CONVERSION_VALUE),
          ct: lightUtil.convertTemperature(state.temperature),
        }
    }
  }
}