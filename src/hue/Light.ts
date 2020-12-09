import {lightUtil} from "../util/LightUtil";
import {GenericUtil} from "../util/GenericUtil";
import { eventBus} from "../util/EventBus";
import {LIGHT_STATE_CHANGE} from "../constants/EventConstants";
import {CrownstoneHueError} from "..";


/**
 * Light object
 *
 * @remarks
 *
 * @param name - Name of the light.
 * @param uniqueId - Unique id of the Light.
 * @param state - The state of the light.
 * @param id - The id of the light on the Bridge.
 * @param bridgeId - The id of the Bridge the Light is connected to.
 * @param capabilities - Capabilities what the light is capable off,  For each light type it's different. Info added on creation from Bridge.
 * @param supportedStates - supported states of the light. For each light type it's different. Info added on creation from Bridge.
 * @param api  - callBack to Api function
 * @param lastUpdate - Timestamp of when the state was last changed.
 * @param intervalId - Timeout object for the interval.
 * @param stateChangeCallback - Callback for when state is change
 *
 */
export class Light {
  name: string;
  readonly uniqueId: string;
  private _stateSentToCallback: HueFullState;
  _currentLightState: HueFullState;
  _prevState: HueFullState;

  inTransition: boolean = false;
  _transitionToState: HueLightState = null;
  _transitionFromState: HueLightState = null;
  _transitionStartedAt: number = 0;
  _lastTransitionTime: number = 4; // n * 100ms

  _type: LightType;
  readonly id: number;
  bridgeId: string;
  capabilities: object;
  supportedStates: string[];
  _api: ((action, extra?) => {});
  _lastUpdate: number;

  stateUpdateCallback = ((state) => {
  });
  _stateCheckStatus: StateEqualCheckVariables = "STATE_UPDATE_SENT";
  _stateNotEqualCount: number = 0;

  constructor(data: LightInitialization) {
    this.name = data.name;
    this.uniqueId = data.uniqueId;
    this._stateSentToCallback = GenericUtil.deepCopy(data.state)
    this._prevState = GenericUtil.deepCopy(data.state)
    this._currentLightState = GenericUtil.deepCopy(data.state)
    this.id = data.id;
    this.bridgeId = data.bridgeId;
    this.capabilities = data.capabilities;
    this.supportedStates = data.supportedStates;
    this._api = data.api;
    this._type = data.type;
    this._lastUpdate = Date.now();
  }

  update(data): void {
    if ("name" in data && data.name !== this.name) {
      this.name = data.name;
    }
    if ("state" in data) {
      this._checkState(data.state);
    }
  }

  /** Sets a Callback to pass new state info on a update
   *
   */
  setStateUpdateCallback(callback: (state) => {}): void {
    this.stateUpdateCallback = callback;
  }

  /** Call to manually renew state from Bridge.
   * BYPASSES non equal count if not equal.
   */
  async renewState() {
    let newState = await this._api("getLightState", this.id) as FailedConnection | HueFullState;

    if (!newState || "hadConnectionFailure" in newState) {
      return;
    }
    this._stateCheckStatus = "STATE_NOT_EQUAL"
    this._stateNotEqualCount = 4;
    this._checkState(newState as HueFullState);
  }

  /**
   * Sets the state of the light.
   */
  async setState(state: StateUpdate): Promise<boolean> {
    if (!this._currentLightState.reachable) {
      return false;
    }
    state = lightUtil.manipulateMinMaxValueStates(state);
    const optimizedState = this._optimizeState(state);
    if (Object.values(optimizedState).length === 0) {
      return true;
    }

    const result = await this._api("setLightState", [this.id.toString(), optimizedState]) as FailedConnection | boolean;
    if (!result) {
      throw new CrownstoneHueError(424, "Setting the state of light " + this.name + " gone wrong.")
    }
    if (typeof (result) !== "boolean" && result.hadConnectionFailure) {
      return false;
    }
    if (result === true) {
      this._updateTransitionState(state);
      return result;
    }
    return false;
  }

  isReachable(): boolean {
    return this._currentLightState["reachable"] || false;
  }

  getInfo(): LightInfo {
    return GenericUtil.deepCopy({
      name: this.name,
      uniqueId: this.uniqueId,
      state: this._currentLightState,
      bridgeId: this.bridgeId,
      id: this.id,
      supportedStates: this.supportedStates,
      capabilities: this.capabilities,
      lastUpdate: this._lastUpdate,
      type: this._type
    });
  }

  getUniqueId(): string {
    return this.uniqueId;
  }

  getSupportedStates(): string[] {
    return this.supportedStates;
  }

  getState(): HueFullState {
    return <HueFullState>GenericUtil.deepCopy(this._currentLightState);
  }

  getLastSentState(): HueFullState {
    return <HueFullState>GenericUtil.deepCopy(this._stateSentToCallback);
  }

  getTransitionToState(): HueStateBase {
    return this._transitionToState
  }

  getTransitionFromState(): HueStateBase {
    return this._transitionFromState
  }

  getType(): LightType {
    return this._type;
  }

  /**
   * Checks given state and updates the state object if different.
   */
  _checkState(newState: HueFullState): void {
    if (!newState) {
      return;
    }
    const isEqual = lightUtil.stateEqual(this._currentLightState, newState);


    if (!isEqual) {
      if(this._retrievedStateIsGivenStateCheck(newState)){
        return;
      }
      this._updateState(newState);
      this._onUnEqualState()
    }
    else if (isEqual && this._currentLightState.reachable === newState.reachable) {
      this._inTransitionCheck();
      this._onEqualState();
    }
    else if (this._currentLightState.reachable !== newState.reachable) {
      this._currentLightState.reachable = newState.reachable
      this._emitCurrentState();
      this._setLastUpdate();
    }
  }

  /** Checks if light is still in transition
   * Checks if state is equal with a time prediction.
   *
   * Time prediction is because sometimes the just set light state is given by the Bridge instead of the light's actual state.
   */
  _inTransitionCheck(){
    const timePassed = this._transitionStartedAt - Date.now();
    if ((this.inTransition && lightUtil.stateEqual(this._transitionToState, this._currentLightState) && (timePassed > this._lastTransitionTime*100))
      ||this.inTransition && timePassed > this._lastTransitionTime+10*100 ) {
      this.inTransition = false;
    }
     }


  /** Checks if given state is equal to the state it has to transition to and under the transition time
   * This is because sometimes during polling, the just passed state to the bridge is given back by the bridge.
   * This is not the actual Light state but probably a cached state.
   */
  _retrievedStateIsGivenStateCheck(state:HueFullState):boolean{
    const timePassed = Date.now() - this._transitionStartedAt;
    return lightUtil.stateEqual(this._transitionToState, state) && (timePassed < this._lastTransitionTime * 100);

  }

  /** Filters unnecessary states for optimization
   *
   *
   * Example: Light is already on, no need to send on command.
   * @param state
   */
  _optimizeState(state: StateUpdate): StateUpdate {
    let newState = {}
    for (const key of Object.keys(state)) {
      if (this._currentLightState[key] !== undefined && state[key] !== this._currentLightState[key]) {
        if (key === "xy" && (this._currentLightState[key][0] !== state[key][0] || this._currentLightState[key][1] !== state[key][1])) {
          newState[key] = [state[key][0], state[key][1]]
        }
        else {
        }
        newState[key] = state[key]
      }
    }
    if (Object.keys(newState).length > 0 && "transitiontime" in state) {
      newState["transitiontime"] = state["transitiontime"]
    }
    if (Object.keys(newState).length > 0 && !this._currentLightState.on) {
      newState["on"] = true;
    }

    return newState;
  }

  /** Should send new state after it was 2 times equal.
   *
   */
  _onEqualState() {
    this._stateNotEqualCount = 0;
    if (this._stateCheckStatus === "STATE_NOT_EQUAL") {
      this._sendCallback();
      this._stateCheckStatus = "STATE_UPDATE_SENT"
    }
  }

  /** Should send new state on the 4th time not equal if expected state is different.
   *
   */
  _onUnEqualState() {
    this._stateCheckStatus = "STATE_NOT_EQUAL"
    this._stateNotEqualCount++;
    if (this._stateNotEqualCount > 3) {
      if (!this._isStateExpected()) {
        this._sendCallback();
      }
      this._stateNotEqualCount = 0;
    }
  }

  _sendCallback() {
    this.stateUpdateCallback(this._currentLightState);
    this._stateSentToCallback = GenericUtil.deepCopy(this._currentLightState);
  }

  //Todo naar 5% absoluut op de from to
  _isStateExpected(): boolean {
    if (!this.inTransition || !this._transitionToState || !this._transitionFromState) {
      return false;
    }
    if("bri" in this._transitionToState){
      const offsetValue = Math.abs(this._transitionFromState.bri - this._transitionToState.bri)*0.05
      const expectedBrightness = lightUtil.calculateCurrentValueLinear(this._transitionFromState.bri, this._transitionToState.bri, this._lastTransitionTime, this._transitionStartedAt)
      const difference = expectedBrightness - this._currentLightState.bri;
      if(!(this._transitionToState.bri === 0 && !this._currentLightState.on) || (difference <= offsetValue && difference >= -offsetValue)){
        return false
      }
    }
    if("sat" in this._transitionToState){
      const offsetValue = Math.abs(this._transitionFromState.sat - this._transitionToState.sat)*0.05
      const expectedSaturation = lightUtil.calculateCurrentValueLinear(this._transitionFromState.sat, this._transitionToState.sat, this._lastTransitionTime, this._transitionStartedAt)
      const difference = expectedSaturation - this._currentLightState.sat;
      if(!(difference <= offsetValue && difference >= -offsetValue)){
        return false
      }
    }
    if("hue" in this._transitionToState){
      const offsetValue = Math.abs(this._transitionFromState.hue - this._transitionToState.hue)*0.05
      const expectedHue = lightUtil.calculateCurrentHue(this._transitionFromState.hue, this._transitionToState.hue, this._lastTransitionTime, this._transitionStartedAt)
      const difference = expectedHue - this._currentLightState.hue;
      if(!(difference <= offsetValue && difference >= -offsetValue)){
        return false
      }
    }
    if("ct" in this._transitionToState){
      const offsetValue = Math.abs(this._transitionFromState.ct - this._transitionToState.ct)*0.05
      const expectedCT = lightUtil.calculateCurrentValueLinear(this._transitionFromState.ct, this._transitionToState.ct, this._lastTransitionTime, this._transitionStartedAt)
      const difference = expectedCT - this._currentLightState.ct;
      if(!(difference <= offsetValue && difference >= -offsetValue)){
        return false
      }
    }
    return true;
  }

  _updateTransitionState(state: StateUpdate): void {
    this._lastTransitionTime = state.transitiontime || 4;
    this._transitionFromState = <HueFullState>GenericUtil.deepCopy(this._currentLightState)
    if (this._transitionToState === null
    ) {
      this._transitionToState = {on: true};
    }
    Object.keys(state).forEach(key => {
      if (lightUtil.isAllowedStateType(key)) {
        this._transitionToState[key] = state[key];
      }
    })
    this._setTransitionStarted()
  }

  _updateState(state: StateUpdate): void {
    this._prevState = <HueFullState>GenericUtil.deepCopy(this._currentLightState)
    Object.keys(state).forEach(key => {
      if (lightUtil.isAllowedStateType(key)) {
        this._currentLightState[key] = state[key];
      }
    })
    this._setLastUpdate()
    this._emitCurrentState();
  }
  _emitCurrentState(){
    eventBus.emit(LIGHT_STATE_CHANGE,JSON.stringify({uniqueId: this.uniqueId,state:this._currentLightState}))
  }

  _setLastUpdate(): void {
    this._lastUpdate = Date.now();
  }

  _setTransitionStarted(): void {
    this._transitionStartedAt = Date.now();
    this.inTransition = true;
  }
}