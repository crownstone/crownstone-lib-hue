/** Switch command
 *  @param value - True | False
 */

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

/** Color temperature command
 * @param temperature - Representation in Kelvin;
 * @param brightness - Should have a range from 0 to 100;
 */
interface colorTemperatureCommand {
  type: "COLOR_TEMPERATURE",
  temperature: number,
  brightness: number
}


type BehaviourStateUpdate = switchCommand | dimmingCommand | colorCommand | colorTemperatureCommand;


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
  saturation: number,
  temperature: number
}

interface ColorableTemperatureState{
  type: "COLORABLE_TEMPERATURE",
  on: boolean,
  temperature: number,
  brightness: number
}
type DeviceState = SwitchableState | DimmableState | ColorableState | ColorableTemperatureState
type DeviceType = "SWITCHABLE" | "DIMMABLE" | "COLORABLE" | "COLORABLE_TEMPERATURE";


interface DeviceBehaviourSupport {
  receiveStateUpdate(state: BehaviourStateUpdate): void

  setStateUpdateCallback(callback: ((state: BehaviourStateUpdate) => void)): void

  getUniqueId(): string

  getDeviceType(): DeviceType

  getState(): DeviceState
}
