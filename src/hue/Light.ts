import {lightUtil} from "../util/LightUtil";
import {GenericUtil} from "../util/GenericUtil";
import {eventBus} from "../util/EventBus";
import {ON_LIGHT_REACHABILITY_CHANGE} from "../constants/EventConstants";
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

  inTransition: boolean  = false;
  _transitionToState: HueLightState = null;
  _transitionFromState: HueLightState = null;
  _transitionStartedAt: number = 0;
  _lastTransitionTime: number = 4; // n * 100ms

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
    state = lightUtil.manipulateMinMaxValueStates(state);
    const result = await this._api("setLightState", [this.id.toString(), this._optimizeState(state)]) as FailedConnection | boolean;
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
      lastUpdate: this._lastUpdate
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

  getTransitionToState():HueStateBase{
    return this._transitionToState
  }

  getTransitionFromState():HueStateBase{
    return this._transitionFromState
  }
  /**
   * Checks given state and updates the state object if different.
   */
  _checkState(newState: HueFullState): void {
    if (!newState) {
      return;
    }
    const isEqual = lightUtil.stateEqual(this._currentLightState, newState);
    if(this.inTransition && lightUtil.stateEqual(this._currentLightState, this._transitionToState)){
      this.inTransition = false;
    }

    if (!isEqual) {
      this._updateState(newState);
      this._onUnEqualState()
    }
    else if (isEqual) {
      this._onEqualState();
    }
    else if (this._currentLightState.reachable !== newState.reachable) {
      eventBus.emit(ON_LIGHT_REACHABILITY_CHANGE, JSON.stringify({
        uniqueId: this.uniqueId,
        reachable: newState.reachable
      }))
      this._currentLightState.reachable = newState.reachable
      this._setLastUpdate();
    }
  }

  /** Filters unnecessary states for optimization
   *
   *
   * Example: Light is already on, no need to send on command.
   * @param state
   */
  _optimizeState(state:StateUpdate):StateUpdate{
      let newState = {}
      for(const key of Object.keys(state)){
          if(this._currentLightState[key] && state[key] !== this._currentLightState[key]){
              if(this._currentLightState[key][0] !== state[key][0] || this._currentLightState[key][1] !== state[key][1]){
                 newState[key] = [state[key][0], state[key][1]]
              } else {
                  newState[key] = state[key]
              }
          }
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

  _isStateExpected(): boolean {
    if(!this.inTransition){
      return false;
    }
    const expectedBrightness = lightUtil.calculateCurrentBrightness(this._transitionFromState.bri, this._transitionToState.bri, this._lastTransitionTime, this._transitionStartedAt)
    const difference = expectedBrightness - this._currentLightState.bri;
    return (this._transitionToState.bri === 0 && !this._currentLightState.on) || (difference <= 12.7 && difference >= -12.7)
  }

  _updateTransitionState(state: StateUpdate): void {
    this._lastTransitionTime = state.transitiontime | 4;
    this._transitionFromState = <HueFullState>GenericUtil.deepCopy(this._currentLightState)
    if(this._transitionToState === null){
      this._transitionToState = {on:true};
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
  }

  _setLastUpdate(): void {
    this._lastUpdate = Date.now();
  }

  _setTransitionStarted(): void {
    this._transitionStartedAt = Date.now();
    this.inTransition = true;
  }
}