import {CrownstoneHue, CrownstoneHueError, Light} from "..";
import {HUE_CONVERSION_VALUE, PERCENTAGE_CONVERSION_VALUE} from "../constants/HueConstants";
import {lightUtil} from "../util/LightUtil";
import {GenericUtil} from "../util/GenericUtil";

export class BehaviourWrapper implements DeviceBehaviourSupport {
  light: Light;
  state: HueFullState
  callback: ((state: BehaviourStateUpdate) => {});

  constructor(light) {
    this.light = light;
    this.state = light.getState();
  }

  async receiveStateUpdate(state: BehaviourStateUpdate): Promise<void> {
    await this.light.setState(this._convertToHue(state));

  }

  setStateUpdateCallback(callback: ((state: BehaviourStateUpdate) => {})): void {
    this.callback = callback;
    this.light.setStateUpdateCallback(this.sendStateToBehaviour.bind(this));
  }

  sendStateToBehaviour(state): void {
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

  getState(): DeviceStates {
    switch (this.getDeviceType()) {
      case "SWITCHABLE":
        return {type: "SWITCHABLE", on: this.light.getState().on}
      case "DIMMABLE":
        return {
          type: "DIMMABLE",
          on: this.light.getState().on,
          brightness: this.light.getState().bri /  PERCENTAGE_CONVERSION_VALUE
        }
      case "COLORABLE":
        return {
          type: "COLORABLE",
          on: this.light.getState().on,
          brightness: this.light.getState().bri /  PERCENTAGE_CONVERSION_VALUE,
          hue: this.light.getState().hue / HUE_CONVERSION_VALUE,
          saturation: this.light.getState().sat /  PERCENTAGE_CONVERSION_VALUE,
          temperature: lightUtil.convertTemperature(this.light.getState().ct)
        }
      case "COLORABLE_TEMPERATURE":
        return {
          type: "COLORABLE_TEMPERATURE",
          on: this.light.getState().on,
          brightness: this.light.getState().bri / PERCENTAGE_CONVERSION_VALUE,
          temperature: lightUtil.convertTemperature(this.light.getState().ct),
        }
    }
  }

  _convertToBehaviourFormat(state: HueFullState): BehaviourStateUpdate {
    const oldState = this.state;
    this.state = GenericUtil.deepCopy(state);
    switch (this.getDeviceType()) {
      case "SWITCHABLE":
        return {type: "SWITCH", value: state.on};
      case "DIMMABLE":
        return (state.on && state.bri != oldState.bri) ? {
          type: "DIMMING",
          value: this.state.bri /  PERCENTAGE_CONVERSION_VALUE
        } : (state.on) ? {type: "SWITCH", value: true} : {type: "SWITCH", value: false}
      case "COLORABLE":
        return ((state.on && state.bri != oldState.bri)) ? {
          type: "COLOR",
          brightness: this.state.bri /  PERCENTAGE_CONVERSION_VALUE,
          hue: this.state.hue / HUE_CONVERSION_VALUE ,
          saturation: this.state.sat /  PERCENTAGE_CONVERSION_VALUE
        } : (state.on) ? {type: "SWITCH", value: true} : {type: "SWITCH", value: false}
      case "COLORABLE_TEMPERATURE":
        return ((state.on && state.bri != oldState.bri)) ? {
          type: "COLOR_TEMPERATURE",
          brightness: this.state.bri /  PERCENTAGE_CONVERSION_VALUE,
          temperature: lightUtil.convertTemperature(this.light.getState().ct),
        } : (state.on) ? {type: "SWITCH", value: true} : {type: "SWITCH", value: false}
    }
  }

  _convertToHue(state: BehaviourStateUpdate): StateUpdate {
    switch (state.type) {
      case "SWITCH":
        return {on: state.value}
      case "DIMMING":
        return (state.value === 0) ? {on: false} : {on: true, bri: state.value * PERCENTAGE_CONVERSION_VALUE}
      case "COLOR":
        return (state.brightness === 0) ? {on: false} : {
          on: true,
          bri: state.brightness * PERCENTAGE_CONVERSION_VALUE,
          sat: state.saturation * PERCENTAGE_CONVERSION_VALUE,
          hue: state.hue * HUE_CONVERSION_VALUE
        }
      case "COLOR_TEMPERATURE":
        return (state.brightness === 0) ? {on: false} : {
          on: true,
          bri: state.brightness * PERCENTAGE_CONVERSION_VALUE,
          ct: lightUtil.convertTemperature(state.temperature),
        }
    }
  }
}