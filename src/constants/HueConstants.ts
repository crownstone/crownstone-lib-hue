
export const APP_NAME: string = 'crownstone-lib-hue';
// export const DEVICE_NAME: string = '';

export const maxValueOfStates = {
  'hue': 65535,
  'bri': 254,
  'sat': 254,
  'xy': [1.0, 1.0],
  'ct': 500
}

export const minValueOfStates = {
  'hue': 0,
  'bri': 1,
  'sat': 0,
  'xy': [0.0, 0.0],
  'ct': 153
}

export const minMaxValueStates = {
  'hue': true,
  'bri': true,
  'sat': true,
  'xy': true,
  'ct': true,
}
export const possibleStates = {
  ...minMaxValueStates,
  'on': true,
  'effect': true,
  'alert': true
}

export const hueStateVariables = {
  'on':true,
  ...minMaxValueStates}

export const DISCOVERY_URL = "https://discovery.meethue.com/";

export const BRIDGE_POLLING_RATE = 1000;

export const RECONNECTION_TIMEOUT_TIME = 10000;

export const HUE_CONVERSION_VALUE = 182.04
export const PERCENTAGE_CONVERSION_VALUE = 2.54

export const HUE_DEFAULT_TRANSITION_TIME = 4;