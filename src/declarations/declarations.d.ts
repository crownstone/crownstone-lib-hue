
interface DiscoverResult {
  id: string,
  internalipaddress: string
}

interface HueStateBase{
  on?: boolean,
  bri?: number,
  hue?: number,
  sat?: number,
  xy?: [number, number],
  ct?: number,
}
interface HueLightState extends HueStateBase{
  on: boolean
}

interface HueFullState extends HueLightState{
  effect?: string,
  alert?: string,
  colormode?: string,
  mode?: string,
  reachable: boolean
}

interface StateUpdate extends HueStateBase{
  effect?: string,
  alert?: string,
  bri_inc?: number;
  hue_inc?: number;
  sat_inc?: number;
  ct_inc?: number;
  xy_inc?: [number, number];
  transitiontime?:number
}


interface BridgeFormat {
  name: string;
  username: string;
  clientKey: string;
  macAddress: string;
  ipAddress: string;
  bridgeId: string;
  lights?: object;
}

type EventUnsubscriber = () => void


interface LightInfo {
  name: string
  uniqueId: string,
  state: HueFullState,
  bridgeId: string,
  id: number,
  capabilities: { control: object },
  supportedStates: string[],
  lastUpdate: number
  type:LightType
}

interface FailedConnection {
  hadConnectionFailure: true;
}

interface BridgeInitialization {
  name?: string,
  username?: string,
  clientKey?: string,
  macAddress?: string,
  ipAddress?: string,
  bridgeId?: string
}

interface LightInitialization {
  name: string,
  uniqueId: string,
  state: HueFullState,
  id: number,
  bridgeId: string,
  capabilities: object,
  supportedStates: string[],
  api: any,
  type:LightType
}

interface HueLightData{
  name: string,
  uniqueid: string,
  state: HueFullState,
  id: number,
  capabilities: {control:{}},
  getSupportedStates(): string[],
  type:LightType
}


interface LightConfig {
  uniqueId: string;
  id: number;
}

interface LightInitFormat extends LightConfig {
  bridgeId: string;
}

type LightStateData = LightStateDataActiveTransition | LightStateDataInActiveTransition

interface LightStateDataInActiveTransition{
  transition : {active: false}
  currentState: HueFullState
}

interface LightStateDataActiveTransition{
  transition : {active: true, data:{from:HueFullState,to:HueFullState,transitiontime:number}, progress: number}
  currentState: HueFullState
}


type StateEqualCheckVariables = "SEND_STATE_UPDATE_NEXT_EQUAL" | "STATE_NOT_EQUAL" | "STATE_UPDATE_SENT";

type LightType = "On/Off light" | "Dimmable light" | "Color temperature light" | "Extended color light" | "Color light" ;

type ApiAction = "createUnauthenticatedApi" | "createAuthenticatedApi" | "getFullBridgeInfo" | "getLightState" | "setLightState" | "getLightById" | "getBridgeConfiguration" | "createUser" | "getAllLights"