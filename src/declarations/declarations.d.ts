
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

interface BridgeInfo {
  name: string;
  username: string;
  clientKey: string;
  macAddress: string;
  ipAddress: string;
  bridgeId: string;
  lights: BridgeLightInfo;
}

interface BridgeLightInfo {
  uniqueId: string,
  id: number,
  name: string;
}

interface LightInfo {
  name: string
  uniqueId: string,
  state: HueFullState,
  bridgeId: string,
  id: number,
  supportedStates: {},
  capabilities: [],
  lastUpdate: number
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
  api: any
}

interface LightCreation{
  name: string,
  uniqueid: string,
  state: HueFullState,
  id: number,
  bridgeId: string,
  capabilities: { control: object },
  getSupportedStates(): string[];
  api: any

}


interface LightConfig {
  uniqueId: string;
  id: number;
}

interface LightInitFormat extends LightConfig {
  bridgeId: string;
}

interface LightCheckFormat{
  uniqueid: string,
  id: number,
  name: string
}


interface connectedLightsOnBridge { [uniqueId: string]: { name: string, id: number } }