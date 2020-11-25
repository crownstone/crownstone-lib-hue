import {
  hueStateVariables,
  maxValueOfStates,
  minMaxValueStates,
  minValueOfStates,
  possibleStates
} from "../constants/HueConstants";

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
  }
}