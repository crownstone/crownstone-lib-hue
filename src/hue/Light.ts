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
    private state: HueFullState;
    readonly id: number;
    bridgeId: string;
    capabilities: object;
    supportedStates: string[];
    api: ((action, extra?) => {});
    lastUpdate: number;
    stateUpdateCallback = ((state) => {
    });


    constructor(data: LightInitialization) {
        this.name = data.name;
        this.uniqueId = data.uniqueId;
        this.state = data.state;
        this.id = data.id;
        this.bridgeId = data.bridgeId;
        this.capabilities = data.capabilities;
        this.supportedStates = data.supportedStates;
        this.api = data.api;
        this.lastUpdate = Date.now();
    }

    update(data):void{
        if("name" in data && data.name !== this.name){
            this.name = data.name;
        }
        if("state" in data){
            this._checkState(data.state);
        }
    }

    /** Sets a Callback to pass new state info on a update
     *
     */
    setStateUpdateCallback(callback:(state) => {}):void {
        this.stateUpdateCallback = callback;
    }

    _setLastUpdate(): void {
        this.lastUpdate = Date.now();
    }


    /** Call to manually renew state from Bridge.
     *
     */
    async renewState(){
        let newState = await this.api("getLightState", this.id) as FailedConnection | HueFullState;
        if(!newState){
            throw new CrownstoneHueError(424,"Getting a light's state gone wrong.")
        }
        if ("hadConnectionFailure" in newState && newState.hadConnectionFailure) {
            return;
        }
        this._checkState(newState as HueFullState);
    }
    /**
     * Checks given state and updates the state object if different.
     */
    _checkState(newState:HueFullState): void {
        if (newState && !lightUtil.stateEqual(this.state, newState)) {
            this.state = <HueFullState>GenericUtil.deepCopy(newState);
            this._setLastUpdate();
            this.stateUpdateCallback(this.state);
        }
        else if (newState && this.state.reachable !== newState.reachable) {
            eventBus.emit(ON_LIGHT_REACHABILITY_CHANGE, JSON.stringify({
                uniqueId: this.uniqueId,
                reachable: newState.reachable
            }))
            this.state.reachable = newState.reachable
            this._setLastUpdate();
        }
    }


    getState(): HueFullState {
        return <HueFullState>GenericUtil.deepCopy(this.state);
    }


    _updateState(state: StateUpdate): void {
        Object.keys(state).forEach(key => {
            if (lightUtil.isAllowedStateType(key)) {
                this.state[key] = state[key];
            }
        });
        this._setLastUpdate()
    }

    /**
     * Sets the state of the light.
     */
    async setState(state: StateUpdate): Promise<boolean> {
        state = lightUtil.manipulateMinMaxValueStates(state);
        const result = await this.api("setLightState", [this.id.toString(), state]) as FailedConnection | boolean;

        if(!result){
            throw new CrownstoneHueError(424,"Setting the state of light " + this.name + " gone wrong.")
        }
        if (typeof(result) !== "boolean" && result.hadConnectionFailure) {
            return false;
        }
        console.log("SET STATE RESULT " + result)
        if (result === true) {
            this._updateState(state);
            return result;

        }
        return false;

    }

    isReachable(): boolean {
        return this.state["reachable"] || false;
    }

    getInfo(): LightInfo {
        return GenericUtil.deepCopy({
            name: this.name,
            uniqueId: this.uniqueId,
            state: this.state,
            bridgeId: this.bridgeId,
            id: this.id,
            supportedStates: this.supportedStates,
            capabilities: this.capabilities,
            lastUpdate: this.lastUpdate
        });
    }

    getUniqueId(): string {
        return this.uniqueId;
    }

    getSupportedStates(): string[] {
        return this.supportedStates;
    }
}