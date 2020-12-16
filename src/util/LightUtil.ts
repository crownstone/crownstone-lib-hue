import {
  hueStateVariables,
  maxValueOfStates,
  minMaxValueStates,
  minValueOfStates,
  possibleStates
} from "../constants/HueConstants";
let colorConvert = require('color-convert');


export const lightUtil = {
  /**
   * Checks if state value is out of it's range and then return right value.
   *
   * @return State value between it's min and max.
   */
  manipulateMinMaxValueStates(state: StateUpdate): StateUpdate {
    Object.keys(state).forEach(key => {
      if ((minMaxValueStates[key] || false)) {
        if (key === "xy") {
          state[key] = [Math.min(maxValueOfStates[key][0], Math.max(minValueOfStates[key][0], state[key][0])), Math.min(maxValueOfStates[key][1], Math.max(minValueOfStates[key][1], state[key][1]))];
        }
        else {
          state[key] = Math.min(maxValueOfStates[key], Math.max(minValueOfStates[key], state[key]));
        }
      }
    });

    return state;
  },

  /** Checks if given states are equal based on HueStateVariables
   * Uses the first State for the keys to iterate through.
   * Ignores reachable field.
   * @param stateA
   * @param stateB
   */
  stateEqual(stateA: HueLightState, stateB: HueLightState): boolean {
    let returnType = false;
    for (const key of Object.keys(stateA)) {
      if (hueStateVariables[key] &&  stateB[key] !== undefined) {
        if (stateA[key] === stateB[key]) {
          returnType = true;
        }
        else if (key === "xy" && stateB[key] !== undefined) {
          if (stateA[key][0] === stateB[key][0] && stateA[key][1] === stateB[key][1]) {
            returnType = true;
          }
        }
        else {
          returnType = false;
          break;
        }
      }
    }
    return returnType;
  },

  isAllowedStateType(state): boolean {
    return possibleStates[state] || false;
  },

  /** Converts Kelvin to mired CT and mired CT to Kelvin.
   *
   * @param temperature
   */
  convertTemperature(temperature: number): number {
    return Math.round(1000000 / temperature);
  },
  HSVtoRGB(color: { hue: number, brightness: number, saturation: number }) {

    let C = color.brightness * color.saturation;
    let X = C * (1)
  },
  /**
   *
   * @param hue - 0 <-> 360
   * @param saturation - 0 <-> 100
   * @param value - 0 <-> 100
   */
  hsvToXY (hue,saturation,value):[number,number]{
    const rgb = colorConvert.hsv.rgb(hue,saturation,value);
    return this.rgbToXY(rgb[0],rgb[1],rgb[2])
  },


  //https://developers.meethue.com/develop/application-design-guidance/color-conversion-formulas-rgb-to-xy-and-back/
  rgbToXY(red, green, blue): [number, number] {
    red = red / 255
    green = green / 255
    blue = blue / 255

    function rgbGammaCorrection() {
      red = (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92);
      green = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
      blue = (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92);
    }

    rgbGammaCorrection();

    const X = red * 0.649926 + green * 0.103455 + blue * 0.197109;
    const Y = red * 0.234327 + green * 0.743075 + blue * 0.022598;
    const Z = red * 0.0000000 + green * 0.053077 + blue * 1.035763;


    let x = X / (X + Y + Z);
    let y = Y / (X + Y + Z);
    return [x, y]
  },
  /** Calculates the supposed value based a point in time.
   * Can be used for Brightness and Saturation
   * Based on a linear transition.
   * @param fromValue
   * @param toValue
   * @param transitionTime
   * @param transitionStartedAt
   */
  calculateCurrentValueLinear(fromValue, toValue, transitionTime, transitionStartedAt) {
    const timePassed = Date.now() - transitionStartedAt;
    let difference = 0;
    if (fromValue > toValue) {
      difference = fromValue - toValue;

      const valPerMS = difference / (transitionTime * 100)
      return fromValue - (timePassed * valPerMS)
    }
    else if (fromValue < toValue) {
      difference = toValue - fromValue;
      const valPerMS = difference / (transitionTime * 100)
      return fromValue + (timePassed * valPerMS)
    }
  },

  /** Calculates the nearest route to a wrapping value and returns the value based on the point in time,
   *
   * Based on a linear transition.
   * @param fromValue
   * @param toValue
   * @param transitionTime
   * @param transitionStartedAt
   */
  calculateCurrentHue(fromValue, toValue, transitionTime, transitionStartedAt) {
    const timePassed = Date.now() - transitionStartedAt

    let dx = Math.abs(fromValue-toValue)

    // backwards
    if(dx > 32768){
      dx = 65535 - dx
      if (fromValue < toValue) {
        const huePerMs = dx / (transitionTime * 100)
        const result = fromValue - (timePassed * huePerMs)
        return (result < 0)? (65535) - Math.abs(result): result
      }
      else if (fromValue > toValue) {
        const huePerMs = dx / (transitionTime * 100)
        const result = fromValue + (timePassed * huePerMs)
        return (result > 65535)? Math.abs(result) - 65535: result

      }
    } else {
      if (fromValue > toValue) {

        const huePerMs = dx / (transitionTime * 100)
        return fromValue - (timePassed * huePerMs)
      }
      else if (fromValue < toValue) {
        const huePerMs = dx / (transitionTime * 100)
        return fromValue + (timePassed * huePerMs)
      }
    }
    // else {
    //
    // }
    //
    // let difference = 0;
    // if (fromValue > toValue) {
    //   difference = fromValue - toValue;
    //
    //   const huePerMs = difference / (transitionTime * 100)
    //   return fromValue - (timePassed * huePerMs)
    // }
    // else if (fromValue < toValue) {
    //   difference = toValue - fromValue;
    //   const huePerMs = difference / (transitionTime * 100)
    //   return fromValue + (timePassed * huePerMs)
    // }


  }
}