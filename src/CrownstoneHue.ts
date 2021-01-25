import {Bridge} from "./hue/Bridge";
import {CrownstoneHueError} from "./util/CrownstoneHueError";
import {Light} from "./hue/Light";
import {eventBus} from "./util/EventBus";

/**
 * CrownstoneHue object
 *
 *
 * @param bridges - List of connected bridges
 * @param lights - List of a wrapped light and aggregator
 *
 */

export class CrownstoneHue {
  bridges: Bridge[] = [];


  /** Adds a given Bridge to the Crownstone Hue object
   * If username is given, starts initialization.
   * If username is not given, use bridge.link();
   * @param bridgeData
   *
   * @returns Bridge object
   */
  async addBridge(bridgeData: BridgeInitialization): Promise<Bridge> {
    if ((bridgeData.bridgeId == null && bridgeData.ipAddress == null) || (bridgeData.bridgeId == null && bridgeData.ipAddress == "")
      || (bridgeData.bridgeId == "" && bridgeData.ipAddress == null) || (bridgeData.bridgeId == "" && bridgeData.ipAddress == "")) {
      throw new CrownstoneHueError(413)
    }
    for (const bridge of this.bridges) {
      if (bridge.bridgeId === bridgeData.bridgeId) {
        throw new CrownstoneHueError(410, bridgeData.bridgeId)
      }
      if (bridge.ipAddress === bridgeData.ipAddress) {
        throw new CrownstoneHueError(411, bridgeData.bridgeId)
      }
    }
    const bridge = new Bridge({
      name: bridgeData.name,
      username: bridgeData.username,
      clientKey: bridgeData.clientKey,
      macAddress: bridgeData.macAddress,
      ipAddress: bridgeData.ipAddress,
      bridgeId: bridgeData.bridgeId
    });
    this.bridges.push(bridge);
    await bridge.init();
    return bridge;
  }

  removeBridge(bridgeId: string): void {
    for (let i = 0; i < this.bridges.length; i++) {
      if (this.bridges[i].bridgeId === bridgeId) {
        this.bridges[i].stopPolling();
        this.bridges.splice(i, 1);
        break;
      }
    }
  }

  /** Returns a map of all connected lights by uniqueId

   */
  getAllConnectedLights(): { [uniqueId: string]: Light } {
    let lights = {}
    for (const bridge of this.bridges) {
      lights = {...lights, ...bridge.getLights()}
    }
    return lights;
  }

  getConfiguredBridges(): Bridge[] {
    return this.bridges;
  }


  stop(): void {
    for (const bridge of this.bridges) {
      bridge.stopPolling()
    }
    eventBus.reset()
  }
}
