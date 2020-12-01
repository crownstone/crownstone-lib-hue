/** Switch command
 *  @param value - True | False
 */
import {Light} from "..";
import {GenericUtil} from "../util/GenericUtil";


interface switchCommand {
  type: "SWITCH",
  value: boolean
}

/** Dimming command.
 * @param value - Should have a range from 0 to 100;
 *
 * Value == 0 == Off, Value > 0 === On + brightness level.
 */
interface dimmingCommand {
  type: "DIMMING",
  value: number
}

/** Color command
 * @param hue - Should have a range from 0 to 360;
 * @param saturation - Should have a range from 0 to 100;
 * @param brightness - Should have a range from 0 to 100;
 */

interface colorCommand {
  type: "COLOR",
  hue: number,
  brightness: number,
  saturation: number
}

type BehaviourStateUpdate = switchCommand | dimmingCommand | colorCommand;

interface SwitchableState {
  type: "SWITCHABLE",
  on: boolean
}

interface DimmableState {
  type: "DIMMABLE",
  on: boolean,
  brightness: number
}

interface ColorableState {
  type: "COLORABLE",
  on: boolean,
  hue: number,
  brightness: number,
  saturation: number
}

type DeviceStates = SwitchableState | DimmableState | ColorableState

type DeviceType = "SWITCHABLE" | "DIMMABLE" | "COLORABLE";


interface DeviceBehaviourSupport {
  receiveStateUpdate(state: BehaviourStateUpdate): void

  setStateUpdateCallback(callback: ((state: BehaviourStateUpdate) => {})): void

  getUniqueId(): string

  getDeviceType(): DeviceType

  getState(): DeviceStates
}

export class BehaviourWrapper implements DeviceBehaviourSupport {
  light: Light;
  state: HueFullState
  callback: ((state: BehaviourStateUpdate) => {});

  constructor(light) {
    this.light = light;
    light.getState();
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
    if ("colorgamut" in this.light.capabilities) {
      return "COLORABLE";
    }
    else if ("ct" in this.light.capabilities) {
      return "DIMMABLE"; // TODO Color temperature lights
    }
    else {
      return "DIMMABLE";
    }
  }

  getState(): DeviceStates {
    return {type: "DIMMABLE", on: this.light.getState().on, brightness: this.light.getState().bri} as DimmableState
  }

  _convertToBehaviourFormat(state: HueFullState): BehaviourStateUpdate {
    const oldState = this.state;
    this.state = GenericUtil.deepCopy(state);
    switch(this.getDeviceType()){
      case "DIMMABLE":
        return (state.on && state.bri != oldState.bri)?{type: "DIMMING", value: this.state.bri}:(state.on)?{type: "SWITCH", value: true}:{type: "SWITCH", value: false}
      case "COLORABLE":
        return ((state.on && state.bri != oldState.bri))?{type: "COLOR", brightness: this.state.bri,hue:this.state.hue,saturation:this.state.sat}:(state.on)?{type: "SWITCH", value: true}:{type: "SWITCH", value: false}
    }
  }

  _convertToHue(state: BehaviourStateUpdate): StateUpdate {
    switch(state.type){
      case "SWITCH":
        return {on: state.value}
      case "DIMMING":
        return (state.value === 0)?{on: false}: {on: true, bri: state.value * 2.54}
      case "COLOR":
        return (state.brightness === 0)?{on: false}:{on: true, bri: state.brightness * 2.54, sat: state.saturation * 2.54, hue: state.hue * 182.04}
        }
    }


}