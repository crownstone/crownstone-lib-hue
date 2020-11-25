import {Bridge} from "./Bridge";
import {v3} from "node-hue-api";
import {DISCOVERY_URL} from "../constants/HueConstants";

const fetch = require('node-fetch');
const discovery = v3.discovery;

export const Discovery = {

  /**
   * Searches the local network for bridges.
   *
   * @returns List of discovered bridges as Bridge.
   *
   */
  discoverBridges: async function (): Promise<Bridge[]> {
    try {
      const discoveryResults = await discovery.nupnpSearch();
      if (discoveryResults.length === 0) {
        return discoveryResults;
      }
      else {
        let bridges: Bridge[] = [];
        discoveryResults.forEach(item => {
          bridges.push(new Bridge({name: item.name, ipAddress: item.ipaddress}));
        })
        return bridges;
      }
    }
    catch (err) {
      if (err.message.includes("ETIMEDOUT")) {
        return [];
      }
      else {
        throw err;
      }
    }
  },
  /**
   * Retrieves online Hue bridges in the local network with Hue's discover url.
   *
   * @remarks
   * Use's Philips Hue's Discovery url {@link https://discovery.meethue.com/} to find Bridges that are online in the local network.
   *
   * @returns
   * An array of DiscoverResult either filled or empty.
   *
   */
  async getBridgesFromDiscoveryUrl(): Promise<DiscoverResult[]> {
    return await fetch(DISCOVERY_URL, {method: "Get"}).then(res => {
      return res.json()
    });
  },
  /** Used to find a bridge by Id.
   * Compares found bridges Ids with given Id.
   * Retrieves bridges with getBridgesFromDiscoveryUrl.
   *
   * @param bridgeId - Id of the bridge that has to be found.
   * @returns DiscoverResult with bridgeId and new Ip on success, or internalipaddress as -1 on failure.
   */
  async discoverBridgeById(bridgeId: string): Promise<DiscoverResult> {
    let possibleBridges = await Discovery.getBridgesFromDiscoveryUrl();
    if (possibleBridges.length === 0) {
      return {id: bridgeId, internalipaddress: "-1"}
    }
    else {
      let result: DiscoverResult = {id: "", internalipaddress: ""};
      for (const item of possibleBridges) {
        if (bridgeId.toLowerCase() === item.id.toLowerCase()) {
          result = item;
          break;
        }
      }
      if (result.id === "") {
        return {id: bridgeId, internalipaddress: "-1"}
      }
      else {
        return result;
      }
    }
  }
}