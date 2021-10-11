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
import { autoBind, createStorage, disposer, getHostedClusterId, openExternal } from "../utils";
import { ForwardedPort, PortForwardItem } from "./port-forward-item";
import { apiBase } from "../api";
import { waitUntilFree } from "tcp-port-used";
import { Notifications } from "../components/notifications";
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
      logger.info("[PORT_FORWARD] starting saved port-forwards");
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
    response = await apiBase.post<PortForwardResult>(`/pods/port-forward/${portForward.namespace}/${portForward.kind}/${portForward.name}?port=${portForward.port}&forwardPort=${portForward.forwardPort}`);
    
    if (response?.port && response.port != +portForward.forwardPort) {
      logger.warn(`specified ${portForward.forwardPort} got ${response.port}`);
    }
  } catch (error) {
    logger.warn(error); // don't care, caller must check 
  }
  portForwardStore.reset();

  return response?.port;
}

export async function getPortForward(portForward: ForwardedPort): Promise<number> {
  let response: PortForwardResult;

  try {
    response = await apiBase.get<PortForwardResult>(`/pods/port-forward/${portForward.namespace}/${portForward.kind}/${portForward.name}?port=${portForward.port}&forwardPort=${portForward.forwardPort}`);
  } catch (error) {
    logger.warn(error); // don't care, caller must check 
  }

  return response?.port;
}

export async function modifyPortForward(portForward: ForwardedPort, desiredPort: number): Promise<number> {
  let port = 0;
  
  try {
    await removePortForward(portForward);
    portForward.forwardPort = desiredPort;
    port = await addPortForward(portForward);
  } catch (error) {
    logger.warn(error); // don't care, caller must check 
  }
  portForwardStore.reset();

  return port;
}


export async function removePortForward(portForward: ForwardedPort) {
  try {
    await apiBase.del(`/pods/port-forward/${portForward.namespace}/${portForward.kind}/${portForward.name}?port=${portForward.port}&forwardPort=${portForward.forwardPort}`);
    await waitUntilFree(+portForward.forwardPort, 200, 1000);
  } catch (error) {
    logger.warn(error); // don't care, caller must check 
  }
  portForwardStore.reset();
}

export async function getPortForwards(): Promise<ForwardedPort[]> {
  try {
    const response = await apiBase.get<PortForwardsResult>(`/pods/port-forwards`);

    return response.portForwards;
  } catch (error) {
    logger.warn(error); // don't care, caller must check 
    
    return [];
  }
}

export function openPortForward(portForward: ForwardedPort) {
  const browseTo = `http://localhost:${portForward.forwardPort}`;

  openExternal(browseTo)
    .catch(error => {
      logger.error(`failed to open in browser: ${error}`, {
        clusterId: portForward.clusterId,
        port: portForward.port,
        kind: portForward.kind,
        namespace: portForward.namespace,
        name: portForward.name,
      });
      Notifications.error(`Failed to open ${browseTo} in browser`);
    }
    );

}

export const portForwardStore = new PortForwardStore();
