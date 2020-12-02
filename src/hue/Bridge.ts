import {Light} from "./Light"
import {v3} from "node-hue-api";
import {CrownstoneHueError} from "..";
import {APP_NAME, DEVICE_NAME, LIGHT_POLLING_RATE, RECONNECTION_TIMEOUT_TIME} from "../constants/HueConstants"  //Device naming for on the Hue Bridge.
import {Discovery} from "./Discovery";
import {GenericUtil} from "../util/GenericUtil";
import Api from "node-hue-api/lib/api/Api"; // library import only used for types
import {eventBus} from "../util/EventBus";
import {
  NEW_LIGHT_ON_BRIDGE,
  ON_BRIDGE_CONNECTION_LOST,
  ON_BRIDGE_CONNECTION_REESTABLISHED,
  ON_BRIDGE_PERSISTENCE_UPDATE
} from "../constants/EventConstants";
import Timeout = NodeJS.Timeout;

const hueApi = v3.api;

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const exemptOfAuthentication = {"createUser": true, "createAuthenticatedApi": true, "createUnauthenticatedApi": true};
const neededForReconnection = {...exemptOfAuthentication}

/**
 * Bridge object
 *
 *
 * @remarks
 * init() should be called before using this object.
 * Uses eventbus topic "onBridgeUpdate" to pass new data.
 *
 * @param lights - Key/Value List of Light objects, Where key is the uniqueId of a list and value the Light object itself for all the lights that are configured with the Bridge object.
 * @param _lightsConnected - Key/Value List for all the lights that are connected to the actual Hue Bridge
 * @param api - An Api from the Hue Library that is used to connect to the Bridge itself. Empty before init.
 * @param name - Name of the Bridge.
 * @param username - The username that is whitelisted on the Hue Bridge. Should be empty if not Bridge isn't linked. May be empty on construct.
 * @param clientKey - The client key that is whitelisted on the Hue Bridge for the Entertainment Api. Should be empty if not Bridge isn't linked. Currently unused. May be empty on construct.
 * @param macAddress - The mac-address of the bridge itself
 * @param ipAddress - The last known ip-address of the bridge.
 * @param bridgeId - The unique id of the bridge.
 * @param reachable - Boolean if bridge is reachable or not.
 * @param reconnecting - Boolean if bridge is reconnecting or not.
 * @param authenticated - Boolean if bridge api connection is authenticated on the Philips Hue Bridge or not.
 *
 */
export class Bridge {
  lights: { [uniqueId: string]: Light } = {};
  _lightsConnected:connectedLightsOnBridge = {} // Array of all Lights connected to the bridge;
  api: Api;
  authenticated: boolean = false;
  name: string | null;
  username: string | null;
  clientKey: string | null;
  macAddress: string | null;
  ipAddress: string | null;
  bridgeId: string | null;
  reachable: boolean = false;
  reconnecting: boolean = false;
  initialized: boolean = false;
  intervalId: Timeout;
  isPolling: boolean = false;

  constructor(data: BridgeInitialization) {
    this.name = data.name || null;
    this.username = data.username || null;
    this.ipAddress = data.ipAddress || null;
    this.clientKey = data.clientKey || null;
    this.macAddress = data.macAddress || null;
    this.bridgeId = data.bridgeId || null;
  }

  /**
   * To be called for initialization of a bridge.
   * If username is empty, attempts to create user on bridge then if button not pressed: throws Error that link button have not been pressed.
   *
   * If Bridge can't be found, it will attempt to rediscover itself every 10 seconds.
   */
  async init(): Promise<void> {
    if (this.bridgeId != null || this.ipAddress != null) {
      if (this.initialized) {
        return;
      }
      if (this.username == null) {
        await this.link();
      }
      else {
        await this.connect();
      }
      this.initialized = true;
    }
  }

  /**
   * Links and connects the bridge to the module. Bridge link button should be pressed before being called.
   *
   * @remarks
   * Attempts to create a user on the bridge.
   * Throws error from createNewUser() when link button is not pressed before linking.
   *
   */
  async link(): Promise<void> {
    await this.createNewUser()
    if (this.username == "") {
      return;
    }
    await this.connect();

  }

  /**
   * Connects the bridge and updates the api variable.
   *
   * @remarks
   * Connects the bridge and updates the api.
   * In case bridge is not found, it starts to rediscover itself through _rediscoveryMyself()
   *
   */
  async connect(): Promise<void> {
    await this._createAuthenticatedApi();
    if (!this.authenticated) {
      return;
    }
    await this.updateBridgeInfo();
  }

  /**
   * Adds a light to the lights list of this bridge.
   *
   * @remarks
   * Used to add a light that is connected to the Hue bridge to the list of this class.
   * Uses the LightConfig interface for data passing.{uniqueId:string, id: number}
   * id refers to the id of the light on the bridge and uniqueId to the uniqueId of a light.
   * Gets info of the light from Bridge and creates a Light object and pushes it to the list.
   * Attempts to find by uniqueId on invalid id or if uniqueId does not match.
   *
   * @Returns uninitialized light object. (Call .init())
   */
  async configureLight(data: LightConfig | Light): Promise<Light> {

    if (this.lights[data.uniqueId]) {
      throw new CrownstoneHueError(409, data.uniqueId)
    }
    if ("name" in data) {
      this.lights[data.uniqueId] = data;
      return data;
    }
    let lightInfo
    let attemptToGetLightInfo = true;
    while (attemptToGetLightInfo) {
      try {
        lightInfo = await this._useApi("getLightById", data.id);
        if (lightInfo != undefined && lightInfo.hadConnectionFailure) {
          await timeout(RECONNECTION_TIMEOUT_TIME)
        }
        else {
          attemptToGetLightInfo = false;
        }
      }
      catch (e) {
        if (e.errorCode && e.errorCode === 422) {
          return await this.configureLightByUniqueId(data.uniqueId);
        }
        else {
          throw e;
        }
      }
    }
    if (lightInfo == undefined) {
      throw new CrownstoneHueError(412, data.uniqueId)
    }
    else if (data.uniqueId !== lightInfo.uniqueid) {
      return await this.configureLightByUniqueId(data.uniqueId);
    }
    else {
      return this._createLight(lightInfo);
    }
  }

  /** Retrieves all lights from bridge and checks by uniqueId.
   * Used as failsafe for configureLight.
   * @param uniqueId
   */
  async configureLightByUniqueId(uniqueId: string): Promise<Light> {
    if (this.lights[uniqueId]) {
      throw new CrownstoneHueError(409, uniqueId)
    }
    let attemptToGetLightInfo = true;
    while (attemptToGetLightInfo) {
      const lightData = await this._useApi("getAllLights");
      if (!lightData) {
        throw new CrownstoneHueError(412, uniqueId);
      }
      if (!lightData.hadConnectionFailure) {
        for (const data of lightData) {
          if (data.uniqueid === uniqueId) {
            const light = this._createLight(data);
            this.lights[data.uniqueId] = light;
            return light;
          }
        }
        throw new CrownstoneHueError(422, uniqueId);
      }
      await timeout(RECONNECTION_TIMEOUT_TIME)
    }
  }

  _createLight(data:LightCreation): Light {
    const light = new Light({
      name: data.name,
      uniqueId: data.uniqueid,
      state: data.state,
      id: data.id,
      bridgeId: this.bridgeId,
      type: data.type,
      capabilities: data.capabilities.control,
      supportedStates: data.getSupportedStates(),
      api: this._useApi.bind(this)
    })
    this.lights[light.uniqueId] = light;
    return light;
  }


  removeLight(uniqueLightId: string): void {
    delete this.lights[uniqueLightId];
  }

  /** Retrieves all the lights that are connected through the module.
   *
   */
  getConnectedLights(): { [uniqueId: string]: Light } {
    return this.lights;
  }

  async updateBridgeInfo():Promise<void> {
    const bridgeConfig = await this._useApi("getFullBridgeInfo");
    if (!bridgeConfig) {
      throw new CrownstoneHueError(424, "Obtaining bridge configuration gone wrong.")
    }
    if (bridgeConfig.hadConnectionFailure) {
      return;
    }
    for (const lightId of Object.keys(bridgeConfig.lights)) {
      if (this.initialized) {
        this._lightsConnected[bridgeConfig.lights[lightId].uniqueid] = {
          name: bridgeConfig.lights[lightId].name,
          id: bridgeConfig.lights[lightId].id
        };
      }
      else {
        const lightInfo = bridgeConfig.lights[lightId]
        this._checkIfNewLight({
          uniqueid: lightInfo.uniqueid,
          name: lightInfo.name,
          id: Number.parseInt(lightId)
        })
      }
    }

    await this.update({
      "bridgeId": bridgeConfig.config.bridgeid,
      "name": bridgeConfig.config.name,
      "macAddress": bridgeConfig.config.mac,
      "reachable": true
    })
  }

  /** Retrieves all lights from the physical bridge.
   *
   */
  async getAllLightsFromBridge(): Promise<{ [uniqueId: string]: Light }> {
    const lights = await this._useApi("getAllLights");
    if (!lights) {
      throw new CrownstoneHueError(424, "Obtaining all lights gone wrong.")
    }
    if (lights.hadConnectionFailure) {
      return {}
    }
    let result = {};
    lights.forEach(light => {
      result[light.uniqueid] = new Light({
        name: light.name,
        uniqueId: light.uniqueid,
        state: light.state,
        id: light.id,
        type: light.type,
        bridgeId: this.bridgeId,
        capabilities: light.capabilities.control,
        supportedStates: light.getSupportedStates(),
        api: this._useApi.bind(this)
      })
    });
    return result;
  }

  /**
   * Connects to the bridge and creates an API that has full access to the bridge.
   * Bridge should be linked and a username should be present before calling.
   *
   */
  async _createAuthenticatedApi(): Promise<void> {
    const result = await this._useApi("createAuthenticatedApi");
    if (!result) {
      throw new CrownstoneHueError(424, "Creating an authenticated Api gone wrong.")
    }
    if (result.hadConnectionFailure) {
      return;
    }
    this.api = result;
    this.reachable = true;
    this.authenticated = true;
  }

  /**
   * Connects to the bridge and creates an API that has limited access to the bridge.
   * @remarks
   * Mainly used to create a user
   */
  async _createUnAuthenticatedApi(): Promise<void> {
    const result = await this._useApi("createUnauthenticatedApi");
    if (!result) {
      throw new CrownstoneHueError(424, "Creating an unauthenticated Api gone wrong.")
    }
    if (result.hadConnectionFailure) {
      return;
    }
    this.api = result;
    this.reachable = true;
    this.authenticated = false;
  }


  /**
   * Creates a user on the Bridge.
   *
   * @remarks
   * Creates a user on the Bridge, link button on bridge should be pressed before being called.
   * Throws error if link button is not pressed
   *
   */
  async createNewUser(): Promise<void> {
    await this._createUnAuthenticatedApi();
    if (!this.reachable) {
      return;
    }
    let createdUser = await this._useApi("createUser");
    if (createdUser === undefined || createdUser.hadConnectionFailure) {
      return;
    }
    this.update({"username": createdUser.username, "clientKey": createdUser.clientkey})
  }

  /**
   * Retrieves all lights from the bridge and adds them to lights list.
   */
  async populateLights(): Promise<{ [uniqueId: string]: Light }> {
    let lights = await this._useApi("getAllLights");
    if (lights.hadConnectionFailure) {
      if (!this.reconnecting) {
        await this.populateLights();
      }
      return;
    }
    lights.forEach(light => {
      if (this.lights[light.uniqueid]) {
        return;
      }
      this.lights[light.uniqueid] = new Light({
        name: light.name,
        uniqueId: light.uniqueid,
        state: light.state,
        id: light.id,
        type: light.type,
        bridgeId: this.bridgeId,
        capabilities: light.capabilities.control,
        supportedStates: light.getSupportedStates(),
        api: this._useApi.bind(this)
      })
    });

    return this.lights;
  }


  /** Extra layer for error handling, in case bridge fails or is turned off.
   */
  async _useApi(action: ApiAction, extra?: number | [] | StateUpdate) {
    if (!exemptOfAuthentication[action]) {
      this._checkAuthentication()
    }
    if (this.reconnecting && !neededForReconnection[action]) {
      return {hadConnectionFailure: true};
    }
    try {
      switch (action) {
        case "getAllLights":
          return await this.api.lights.getAll();
        case "createUser":
          return await this.api.users.createUser(APP_NAME, DEVICE_NAME);
        case "getBridgeConfiguration":
          return await this.api.configuration.getConfiguration();
        case "getLightById":
          return await this.api.lights.getLight(extra);
        case "setLightState":
          return await this.api.lights.setLightState(extra[0], extra[1]);
        case "getLightState":
          return await this.api.lights.getLightState(extra);
        case "getFullBridgeInfo":
          return await this.api.configuration.getAll();
        case "createAuthenticatedApi":
          return await hueApi.createLocal(this.ipAddress).connect(this.username) as Api;
        case "createUnauthenticatedApi":
          return await hueApi.createLocal(this.ipAddress).connect() as Api;
        default:
          throw new CrownstoneHueError(888);
      }
    }
    catch (err) {
      if (GenericUtil.isConnectionError(err)) {
        return await this._attemptReconnection();
      }
      else {
        if (typeof (err.getHueErrorType) === "function") {
          GenericUtil.convertHueLibraryToCrownstoneError(err, extra);
        }
        else {
          throw err;
        }
      }
    }
  }

  /** Reconnection loop.
   *
   */
  async _attemptReconnection(): Promise<FailedConnection> {
    if (!this.reconnecting) {
      eventBus.emit(ON_BRIDGE_CONNECTION_LOST, this.bridgeId)
      this.reconnecting = true;
      while (this.reconnecting) {
        try {
          this.reachable = false;
          await this._rediscoverMyself();
          this.reconnecting = false;
          eventBus.emit(ON_BRIDGE_CONNECTION_REESTABLISHED, this.bridgeId)
        }
        catch (err) {
          if (GenericUtil.isConnectionError(err)) {
            await timeout(RECONNECTION_TIMEOUT_TIME);
          }
          else {
            this.reconnecting = false;
            throw err;
          }
        }
      }
    }
    return {hadConnectionFailure: true};
  }

  _checkAuthentication(): void {
    if (!this.authenticated) {
      throw new CrownstoneHueError(405);
    }
  }

  isReachable(): boolean {
    return this.reachable;
  }

  isReconnecting(): boolean {
    return this.reconnecting;
  }

  /**
   * Rediscovers Bridge in case of failed connection
   *
   * @remarks
   * Retrieves bridge with discoverBridgeById.
   * Success:
   * If bridge is found it updates bridge info and creates the API for it.
   * Fail:
   * If the bridge is not found in the network it throws Error
   *
   */
  private async _rediscoverMyself(): Promise<void> {
    if (this.bridgeId == undefined) {
      throw new CrownstoneHueError(408);
    }
    const result = await Discovery.discoverBridgeById(this.bridgeId);
    if (result.internalipaddress === "-1") {
      throw new CrownstoneHueError(404, "Bridge with id " + this.bridgeId + " not found.");
    }
    else {
      this.ipAddress = result.internalipaddress;
      await this.init()
      this.update({ipAddress: this.ipAddress});
    }
  }

  getLightById(uniqueId: string): Light {
    return this.lights[uniqueId];
  }

  startPolling(): void {
    if (this.isPolling) {
      return;
    }
    this._checkAuthentication();
    this.isPolling = true;
    this.intervalId = setInterval(async () => await this._pollingEvent(), LIGHT_POLLING_RATE);
  }

  stopPolling(): void {
    clearInterval(this.intervalId);
    this.isPolling = false;
  }

  async _pollingEvent(): Promise<void> {
    const lights = await this._useApi("getAllLights");
    for (const light of lights) {
      this._checkIfNewLight(light);
      this._sendInfoToLight(light);
    }
  }

  _checkIfNewLight(light:LightCheckFormat): void {
    if (this._lightsConnected[light.uniqueid]) {
      if (this._lightsConnected[light.uniqueid].id !== light.id) {
        this._lightsConnected[light.uniqueid].id = light.id;
      }
      if (this._lightsConnected[light.uniqueid].name !== light.name) {
        this._lightsConnected[light.uniqueid].name = light.name;
      }
    }
    else if (!this._lightsConnected[light.uniqueid]) {
      eventBus.emit(NEW_LIGHT_ON_BRIDGE, JSON.stringify({
        name: light.name,
        uniqueId: light.uniqueid,
        id: light.id,
        bridgeId: this.bridgeId
      }))
      this._lightsConnected[light.uniqueid] = {name: light.name, id: light.id};
    }
  }

  _sendInfoToLight(lightInfo): void {
    if (this.lights[lightInfo.uniqueid]) {
      this.lights[lightInfo.uniqueid].update(lightInfo);
    }
  }

  update(values: object, onlyUpdate: boolean = false): void {
    let saveValue = false;
    if (values["name"] !== undefined && this.name !== values["name"]) {
      this.name = values["name"]
      saveValue = true;
    }
    if (values["ipAddress"] !== undefined && this.ipAddress !== values["ipAddress"]) {
      this.ipAddress = values["ipAddress"]
      saveValue = true;
    }
    if (values["username"] !== undefined && this.username !== values["username"]) {
      this.username = values["username"]
      saveValue = true;
    }
    if (values["clientKey"] !== undefined && this.clientKey !== values["clientKey"]) {
      this.clientKey = values["clientKey"]
      saveValue = true;
    }
    if (values["macAddress"] !== undefined && this.macAddress !== values["macAddress"]) {
      this.macAddress = values["macAddress"]
      saveValue = true;
    }
    if (values["bridgeId"] !== undefined && this.bridgeId !== values["bridgeId"]) {
      this.bridgeId = values["bridgeId"]
      saveValue = true;
    }

    if (values["reachable"] !== undefined) {
      this.reachable = values["reachable"]
    }
    if (values["authenticated"] !== undefined) {
      this.authenticated = values["authenticated"]
    }
    if (values["reconnecting"] !== undefined) {
      this.reconnecting = values["reconnecting"]
    }
    if (saveValue && !onlyUpdate) {
      this.save();
    }
  }

  /** Sends out an event with topic "onBridgeUpdate" with the current variable values for saving.
   */
  save(): void {
    const saveState =
      {
        name: this.name,
        ipAddress: this.ipAddress,
        macAddress: this.macAddress,
        username: this.username,
        clientKey: this.clientKey,
        bridgeId: this.bridgeId,
        lights: Object.values(this.lights).map((light) => {
          return {name: light.name, id: light.id, uniqueId: light.uniqueId}
        })
      }
    eventBus.emit(ON_BRIDGE_PERSISTENCE_UPDATE, JSON.stringify(saveState))
  }

  getInfo(): object {
    return {
      name: this.name,
      ipAddress: this.ipAddress,
      macAddress: this.macAddress,
      username: this.username,
      clientKey: this.clientKey,
      bridgeId: this.bridgeId,
      reachable: this.reachable,
      authenticated: this.authenticated,
      reconnecting: this.reconnecting,
      lights: this.lights
    };
  }
}
