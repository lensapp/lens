/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


import { makeObservable, observable, reaction } from "mobx";
import { ItemStore } from "../../common/item.store";
import { autoBind, createStorage, disposer, getHostedClusterId } from "../utils";
import { ForwardedPort, PortForwardItem } from "./port-forward-item";
import { apiBase } from "../api";
import { waitUntilFree } from "tcp-port-used";
import logger from "../../common/logger";

export class PortForwardStore extends ItemStore<PortForwardItem> {
  private storage = createStorage<ForwardedPort[] | undefined>("port_forwards", undefined);

  @observable portForwards: PortForwardItem[];

  constructor() {
    super();
    makeObservable(this);
    autoBind(this);

    this.init();
  }

  private async init() {
    await this.storage.whenReady;

    const savedPortForwards = this.storage.get(); // undefined on first load

    if (Array.isArray(savedPortForwards)) {
      logger.info("[PORT-FORWARD-STORE] starting saved port-forwards");
      await Promise.all(savedPortForwards.map(addPortForward));
    }
  }

  watch() {
    return disposer(
      reaction(() => this.portForwards, () => this.loadAll()),
    );
  }

  loadAll() {
    return this.loadItems(async () => {
      let portForwards = await getPortForwards();

      // filter out any not for this cluster
      portForwards = portForwards.filter(pf => pf.clusterId == getHostedClusterId());
      this.storage.set(portForwards);

      this.reset();
      portForwards.map(pf => this.portForwards.push(new PortForwardItem(pf)));

      return this.portForwards;
    });
  }

  reset() {
    this.portForwards = [];
  }

  async removeSelectedItems() {
    return Promise.all(this.selectedItems.map(removePortForward));
  }

  getById(id: string) {
    const index = this.getIndexById(id);

    if (index === -1) {
      return null;
    }

    return this.getItems()[index];
  }
}

interface PortForwardResult {
  port: number;
}

interface PortForwardsResult {
  portForwards: ForwardedPort[];
}

export async function addPortForward(portForward: ForwardedPort): Promise<number> {
  let response: PortForwardResult;

  try {
    const protocol = portForward.protocol ?? "http";

    response = await apiBase.post<PortForwardResult>(`/pods/port-forward/${portForward.namespace}/${portForward.kind}/${portForward.name}?port=${portForward.port}&forwardPort=${portForward.forwardPort}&protocol=${protocol}`);

    // expecting the received port to be the specified port, unless the specified port is 0, which indicates any available port is suitable
    if (portForward.forwardPort && response?.port && response.port != +portForward.forwardPort) {
      logger.warn(`[PORT-FORWARD-STORE] specified ${portForward.forwardPort} got ${response.port}`);
    }
  } catch (error) {
    logger.warn("[PORT-FORWARD-STORE] Error adding port-forward:", error, portForward);
    throw(error);
  }
  portForwardStore.reset();

  return response?.port;
}

function getProtocolQuery(protocol: string) {
  if (protocol) {
    return `&protocol=${protocol}`;
  }

  return "";
}

export async function getPortForward(portForward: ForwardedPort): Promise<number> {
  let response: PortForwardResult;

  try {
    response = await apiBase.get<PortForwardResult>(`/pods/port-forward/${portForward.namespace}/${portForward.kind}/${portForward.name}?port=${portForward.port}&forwardPort=${portForward.forwardPort}${getProtocolQuery(portForward.protocol)}`);
  } catch (error) {
    logger.warn("[PORT-FORWARD-STORE] Error getting port-forward:", error, portForward);
    throw(error);
  }

  return response?.port;
}

export async function modifyPortForward(portForward: ForwardedPort, desiredPort: number): Promise<number> {
  let port = 0;
  
  await removePortForward(portForward);
  portForward.forwardPort = desiredPort;
  port = await addPortForward(portForward);

  portForwardStore.reset();

  return port;
}


export async function removePortForward(portForward: ForwardedPort) {
  try {
    await apiBase.del(`/pods/port-forward/${portForward.namespace}/${portForward.kind}/${portForward.name}?port=${portForward.port}&forwardPort=${portForward.forwardPort}`);
    await waitUntilFree(+portForward.forwardPort, 200, 1000);
  } catch (error) {
    logger.warn("[PORT-FORWARD-STORE] Error removing port-forward:", error, portForward);
    throw(error);
  }
  portForwardStore.reset();
}

export async function getPortForwards(): Promise<ForwardedPort[]> {
  try {
    const response = await apiBase.get<PortForwardsResult>(`/pods/port-forwards`);

    return response.portForwards;
  } catch (error) {
    logger.warn("[PORT-FORWARD-STORE] Error getting all port-forwards:", error);
    
    return [];
  }
}

export const portForwardStore = new PortForwardStore();
