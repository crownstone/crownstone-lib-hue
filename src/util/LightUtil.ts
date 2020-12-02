import {
  hueStateVariables,
  maxValueOfStates,
  minMaxValueStates,
  minValueOfStates,
  possibleStates
} from "../constants/HueConstants";

const kelvinToRgb = {
  1000: [255, 56, 0],
  1100: [255, 71, 0],
  1200: [255, 83, 0],
  1300: [255, 93, 0],
  1400: [255, 101, 0],
  1500: [255, 109, 0],
  1600: [255, 115, 0],
  1700: [255, 121, 0],
  1800: [255, 126, 0],
  1900: [255, 131, 0],
  2000: [255, 138, 18],
  2100: [255, 142, 33],
  2200: [255, 147, 44],
  2300: [255, 152, 54],
  2400: [255, 157, 63],
  2500: [255, 161, 72],
  2600: [255, 165, 79],
  2700: [255, 169, 87],
  2800: [255, 173, 94],
  2900: [255, 177, 101],
  3000: [255, 180, 107],
  3100: [255, 184, 114],
  3200: [255, 187, 120],
  3300: [255, 190, 126],
  3400: [255, 193, 132],
  3500: [255, 196, 137],
  3600: [255, 199, 143],
  3700: [255, 201, 148],
  3800: [255, 204, 153],
  3900: [255, 206, 159],
  4000: [255, 209, 163],
  4100: [255, 211, 168],
  4200: [255, 213, 173],
  4300: [255, 215, 177],
  4400: [255, 217, 182],
  4500: [255, 219, 186],
  4600: [255, 221, 190],
  4700: [255, 223, 194],
  4800: [255, 225, 198],
  4900: [255, 227, 202],
  5000: [255, 228, 206],
  5100: [255, 230, 210],
  5200: [255, 232, 213],
  5300: [255, 233, 217],
  5400: [255, 235, 220],
  5500: [255, 236, 224],
  5600: [255, 238, 227],
  5700: [255, 239, 230],
  5800: [255, 240, 233],
  5900: [255, 242, 236],
  6000: [255, 243, 239],
  6100: [255, 244, 242],
  6200: [255, 245, 245],
  6300: [255, 246, 247],
  6400: [255, 248, 251],
  6500: [255, 249, 253],
  6600: [254, 249, 255],
  6700: [252, 247, 255],
  6800: [249, 246, 255],
  6900: [247, 245, 255],
  7000: [245, 243, 255],
  7100: [243, 242, 255],
  7200: [240, 241, 255],
  7300: [239, 240, 255],
  7400: [237, 239, 255],
  7500: [235, 238, 255],
  7600: [233, 237, 255],
  7700: [231, 236, 255],
  7800: [230, 235, 255],
  7900: [228, 234, 255],
  8000: [227, 233, 255],
  8100: [225, 232, 255],
  8200: [224, 231, 255],
  8300: [222, 230, 255],
  8400: [221, 230, 255],
  8500: [220, 229, 255],
  8600: [218, 229, 255],
  8700: [217, 227, 255],
  8800: [216, 227, 255],
  8900: [215, 226, 255],
  9000: [214, 225, 255],
  9100: [212, 225, 255],
  9200: [211, 224, 255],
  9300: [210, 223, 255],
  9400: [209, 223, 255],
  9500: [208, 222, 255],
  9600: [207, 221, 255],
  9700: [207, 221, 255],
  9800: [206, 220, 255],
  9900: [205, 220, 255],
  10000: [207, 218, 255],
  10100: [207, 218, 255],
  10200: [206, 217, 255],
  10300: [205, 217, 255],
  10400: [204, 216, 255],
  10500: [204, 216, 255],
  10600: [203, 215, 255],
  10700: [202, 215, 255],
  10800: [202, 214, 255],
  10900: [201, 214, 255],
  11000: [200, 213, 255],
  11100: [200, 213, 255],
  11200: [199, 212, 255],
  11300: [198, 212, 255],
  11400: [198, 212, 255],
  11500: [197, 211, 255],
  11600: [197, 211, 255],
  11700: [197, 210, 255],
  11800: [196, 210, 255],
  11900: [195, 210, 255],
  12000: [195, 209, 255]
}

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
   * Ignores reachable field.
   * @param stateA
   * @param stateB
   */
  stateEqual(stateA:HueLightState, stateB:HueLightState):boolean {
    let returnType = false;
    for (const key of Object.keys(stateA)) {
      if ((hueStateVariables[key])) {
        if (stateA[key] === stateB[key]) {
          returnType = true;
        }
        else if (key === "xy") {
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

  kelvinToMiredCT(kelvin:number):number{
    return 1000000/kelvin;
  },
  miredCTToKelvin(miredCT:number):number{
    return 1000000*miredCT;
  },
  // HSBToMiredCT(hue:number,sat:number,bri:number){
  //
  // },
  // kelvinToRGB(kelvin) {
  // return kelvinToRgb[kelvin];
  // },
  // RGBtoKelvin(rgb){
  //
  // },
  // RGBtoHSB(rgb){
  //
  // },
  // HSBtoRGB(HSB){
  //
  // },


  //https://developers.meethue.com/develop/application-design-guidance/color-conversion-formulas-rgb-to-xy-and-back/
  rgbToXY(red,green,blue):[number,number]{
    red = red / 255
    green = green / 255
    blue = blue / 255

    function rgbGammaCorrection(){
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
    return [x,y]
  },
  //
  // xyToRGB(xy:[number,number],brightness):[number,number,number]{
  //   let x = xy[0]; // the given x value
  //   let y = xy[1]; // the given y value
  //   let z = 1.0 - x - y;
  //   let Y = brightness; // The given brightness value
  //   let X = (Y / y) * x;
  //   let Z = (Y / y) * z;
  //
  //   let r =  X * 1.656492 - Y * 0.354851 - Z * 0.255038;
  //   let g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
  //   let b =  X * 0.051713 - Y * 0.121364 + Z * 1.011530;
  //
  //
  //   r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
  //   g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
  //   b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
  //   return [r,g,b];
  // },


  /** Calculates the supposed brightness based a point in time.
   *
   * @param fromBrightness
   * @param toBrightness
   * @param transitionTime
   * @param transitionStartedAt
   */
  calculateCurrentBrightness(fromBrightness,toBrightness,transitionTime,transitionStartedAt){
    // difference - (MS since trans. Start * ( difference / total time ms) = Calc bri
      const timePassed = Date.now() - transitionStartedAt;
      let difference = 0;
      if(fromBrightness > toBrightness){
        difference = fromBrightness - toBrightness;

        const briPerMS = difference / ( transitionTime * 100)
        return fromBrightness - (timePassed * briPerMS)
      } else if(fromBrightness < toBrightness) {
        difference =  toBrightness - fromBrightness;
        const briPerMS = difference / ( transitionTime * 100)
        return fromBrightness + (timePassed * briPerMS)
      }
    }
}