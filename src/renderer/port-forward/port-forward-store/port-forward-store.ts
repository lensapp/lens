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
import { ItemStore } from "../../../common/item.store";
import { autoBind, disposer, getHostedClusterId, StorageHelper } from "../../utils";
import { ForwardedPort, PortForwardItem } from "../port-forward-item";
import { apiBase } from "../../api";
import logger from "../../../common/logger";
import { waitUntilFree } from "tcp-port-used";

interface Dependencies {
  storage: StorageHelper<ForwardedPort[] | undefined>
}

export class PortForwardStore extends ItemStore<PortForwardItem> {
  @observable portForwards: PortForwardItem[];

  constructor(private dependencies: Dependencies) {
    super();
    makeObservable(this);
    autoBind(this);

    this.init();
  }

  private async init() {
    await this.dependencies.storage.whenReady;

    const savedPortForwards = this.dependencies.storage.get(); // undefined on first load

    if (Array.isArray(savedPortForwards)) {
      logger.info("[PORT-FORWARD-STORE] starting saved port-forwards");
      await Promise.all(savedPortForwards.map(this.add));
    }
  }

  watch() {
    return disposer(
      reaction(() => this.portForwards, () => this.loadAll()),
    );
  }

  loadAll() {
    return this.loadItems(async () => {
      const portForwards = await getPortForwards(getHostedClusterId());

      this.dependencies.storage.set(portForwards);

      this.reset();
      portForwards.map(pf => this.portForwards.push(new PortForwardItem(pf)));

      return this.portForwards;
    });
  }

  reset = () => {
    this.portForwards = [];
  };

  async removeSelectedItems() {
    return Promise.all(this.selectedItems.map(this.remove));
  }

  getById(id: string) {
    const index = this.getIndexById(id);

    if (index === -1) {
      return null;
    }

    return this.getItems()[index];
  }

  add = async (portForward: ForwardedPort): Promise<number> => {
    const { port, forwardPort } = portForward;
    let response: PortForwardResult;

    try {
      const protocol = portForward.protocol ?? "http";

      response = await apiBase.post<PortForwardResult>(`/pods/port-forward/${portForward.namespace}/${portForward.kind}/${portForward.name}`, { query: { port, forwardPort, protocol }});

      // expecting the received port to be the specified port, unless the specified port is 0, which indicates any available port is suitable
      if (portForward.forwardPort && response?.port && response.port != +portForward.forwardPort) {
        logger.warn(`[PORT-FORWARD-STORE] specified ${portForward.forwardPort} got ${response.port}`);
      }
    } catch (error) {
      logger.warn("[PORT-FORWARD-STORE] Error adding port-forward:", error, portForward);
      throw (error);
    }

    this.reset();

    return response?.port;
  };

  remove = async (portForward: ForwardedPort) => {
    const { port, forwardPort } = portForward;

    try {
      await apiBase.del(`/pods/port-forward/${portForward.namespace}/${portForward.kind}/${portForward.name}`, { query: { port, forwardPort }});
      await waitUntilFree(+forwardPort, 200, 1000);
    } catch (error) {
      logger.warn("[PORT-FORWARD-STORE] Error removing port-forward:", error, portForward);
      throw (error);
    }

    this.reset();
  };

  modify = async (portForward: ForwardedPort, desiredPort: number): Promise<number> => {
    await this.remove(portForward);

    portForward.forwardPort = desiredPort;

    const port = await this.add(portForward);

    this.reset();

    return port;
  };
}

export interface PortForwardResult {
  port: number;
}

interface PortForwardsResult {
  portForwards: ForwardedPort[];
}

export async function getPortForward(portForward: ForwardedPort): Promise<number> {
  const { port, forwardPort, protocol } = portForward;
  let response: PortForwardResult;

  try {
    response = await apiBase.get<PortForwardResult>(`/pods/port-forward/${portForward.namespace}/${portForward.kind}/${portForward.name}`, { query: { port, forwardPort, protocol }});
  } catch (error) {
    logger.warn("[PORT-FORWARD-STORE] Error getting port-forward:", error, portForward);
    throw (error);
  }

  return response?.port;
}


export async function getPortForwards(clusterId?: string): Promise<ForwardedPort[]> {
  try {
    const response = await apiBase.get<PortForwardsResult>("/pods/port-forwards", { query: { clusterId }});

    return response.portForwards;
  } catch (error) {
    logger.warn("[PORT-FORWARD-STORE] Error getting all port-forwards:", error);

    return [];
  }
}
