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


import { action, makeObservable, observable, reaction } from "mobx";
import { ItemStore } from "../../common/item.store";
import { autoBind, createStorage, disposer } from "../utils";
import { ForwardedPort, forwardedPortStatus, PortForwardItem } from "./port-forward-item";
import { apiBase } from "../api";
import { waitUntilFree } from "tcp-port-used";
import logger from "../../common/logger";
import { Notifications } from "../components/notifications";

export class PortForwardStore extends ItemStore<PortForwardItem> {
  private storage = createStorage<ForwardedPort[] | undefined>("port_forwards", undefined);

  @observable portForwards: PortForwardItem[] = [];

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
      const results = await Promise.allSettled(savedPortForwards.map(addPortForward));

      for (const result of results) {
        if (result.status === "rejected") {
          Notifications.error("One or more port-forwards could not be started", { timeout: 10_000 });
          
          return;
        }
      }
    }
  }

  watch() {
    return disposer(
      reaction(() => portForwardStore.portForwards.slice(), () => portForwardStore.loadAll()),
    );
  }

  loadAll() {
    return this.loadItems(() => {
      const portForwards = getPortForwards();

      this.storage.set(portForwards);

      this.portForwards = [];
      portForwards.map(pf => this.portForwards.push(new PortForwardItem(pf)));

      return this.portForwards;
    });
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

function portForwardsEqual(portForward: ForwardedPort) {
  return (pf: ForwardedPort) => (
    pf.kind == portForward.kind &&
    pf.name == portForward.name &&
    pf.namespace == portForward.namespace &&
    pf.port == portForward.port
  );
}

function findPortForward(portForward: ForwardedPort) {
  return portForwardStore.portForwards.find(portForwardsEqual(portForward));

}

const setPortForward = action((portForward: ForwardedPort) => {
  const index = portForwardStore.portForwards.findIndex(portForwardsEqual(portForward));
  
  if (index < 0 ) {
    return;
  }

  portForwardStore.portForwards[index] = new PortForwardItem(portForward);
});

export const startPortForward = action( async (portForward: ForwardedPort): Promise<number> => {
  const pf = findPortForward(portForward);
  
  if (!pf) {
    const error = new Error("port-forward not found");

    logger.warn("[PORT-FORWARD-STORE] Error starting port-forward:", error, portForward);
    throw(error);    
  }

  const { port, forwardPort } = pf;
  let response: PortForwardResult;

  try {
    const protocol = pf.protocol ?? "http";

    response = await apiBase.post<PortForwardResult>(`/pods/port-forward/${pf.namespace}/${pf.kind}/${pf.name}`, { query: { port, forwardPort, protocol }});

    // expecting the received port to be the specified port, unless the specified port is 0, which indicates any available port is suitable
    if (pf.forwardPort && response?.port && response.port != +pf.forwardPort) {
      logger.warn(`[PORT-FORWARD-STORE] specified ${pf.forwardPort}, got ${response.port}`);
    }

    pf.forwardPort = response.port;
    pf.status = "Active";

  } catch (error) {
    logger.warn("[PORT-FORWARD-STORE] Error starting port-forward:", error, pf);
    pf.status = "Disabled";
    throw (error);
  } finally {
    setPortForward(pf);
  }

  return response?.port;
});

export const addPortForward = action(async (portForward: ForwardedPort): Promise<number> => {
  const pf = findPortForward(portForward);

  if (pf) {
    return pf.forwardPort;
  }

  portForwardStore.portForwards.push(new PortForwardItem(portForward));

  if (!portForward.status) {
    portForward.status = "Active";
  }

  try {
    if (portForward.status === "Active") {
      const port = await startPortForward(portForward);
      
      portForward.forwardPort = port;
    }
  } catch (error) {
    logger.warn("[PORT-FORWARD-STORE] Error adding port-forward:", error, portForward);
    throw(error);
  }

  return portForward.forwardPort;
});

export async function getActivePortForward(portForward: ForwardedPort): Promise<number> {
  const { port, forwardPort, protocol } = portForward;
  let response: PortForwardResult;

  try {
    response = await apiBase.get<PortForwardResult>(`/pods/port-forward/${portForward.namespace}/${portForward.kind}/${portForward.name}`, { query: { port, forwardPort, protocol }});
  } catch (error) {
    logger.warn("[PORT-FORWARD-STORE] Error getting active port-forward:", error, portForward);
    throw (error);
  }

  return response?.port;
}

export async function getPortForward(portForward: ForwardedPort): Promise<number> {

  const pf = findPortForward(portForward);
  
  if (!pf) {
    throw new Error("port-forward not found");
  }

  try {
    // check if the port-forward is active, and if so check if it has the same local port
    const port = await getActivePortForward(portForward);

    if (port && port !== pf.forwardPort) {
      logger.warn(`[PORT-FORWARD-STORE] local port, expected ${pf.forwardPort}, got ${port}`);
    }
  } catch (error) {
    // port is not active
  }

  return pf.forwardPort;
}

export async function getPortForwardStatus(portForward: ForwardedPort): Promise<forwardedPortStatus> {

  const pf = findPortForward(portForward);
  
  if (!pf) {
    throw new Error("port-forward not found");
  }

  try {
    await getActivePortForward(portForward);

  } catch (error) {
    // port is not active
    return "Disabled";
  }

  return pf.status;
}

export const modifyPortForward = action(async (portForward: ForwardedPort, desiredPort: number): Promise<number> => {
  let port = 0;

  await removePortForward(portForward);
  portForward.forwardPort = desiredPort;
  port = await addPortForward(portForward);

  return port;
});


export const stopPortForward = action(async (portForward: ForwardedPort) => {
  const pf = findPortForward(portForward);
  
  if (!pf) {
    const error = new Error("port-forward not found");

    logger.warn("[PORT-FORWARD-STORE] Error getting port-forward:", error, portForward);
    
    return;
  }

  const { port, forwardPort } = portForward;

  try {
    await apiBase.del(`/pods/port-forward/${portForward.namespace}/${portForward.kind}/${portForward.name}`, { query: { port, forwardPort }});
    await waitUntilFree(+forwardPort, 200, 1000);
  } catch (error) {
    logger.warn("[PORT-FORWARD-STORE] Error removing active port-forward:", error, portForward);
    throw (error);
  }

  pf.status = "Disabled";
  setPortForward(pf);
});

export const removePortForward = action(async (portForward: ForwardedPort) => {
  const pf = findPortForward(portForward);

  if (!pf) {
    const error = new Error("port-forward not found");

    logger.warn("[PORT-FORWARD-STORE] Error getting port-forward:", error, portForward);
    
    return;
  }

  try {
    await stopPortForward(portForward);
  } catch (error) {
    if (pf.status === "Active") {
      logger.warn("[PORT-FORWARD-STORE] Error removing port-forward:", error, portForward);
    }
  }

  const index = portForwardStore.portForwards.findIndex(portForwardsEqual(portForward));
  
  if (index >= 0 ) {
    console.log("removePortForward splice", index, portForwardStore.portForwards[index]);
    portForwardStore.portForwards.splice(index, 1);
    console.log("portForwards after splice", portForwardStore.portForwards);
  }
});

export async function getActivePortForwards(clusterId?: string): Promise<ForwardedPort[]> {
  try {
    const response = await apiBase.get<PortForwardsResult>("/pods/port-forwards", { query: { clusterId }});

    return response.portForwards;
  } catch (error) {
    logger.warn("[PORT-FORWARD-STORE] Error getting all port-forwards:", error);

    return [];
  }
}

export function getPortForwards(): ForwardedPort[] {
  return portForwardStore.portForwards;
}

export const getPortForwardsStatus = action(async (clusterId?: string): Promise<ForwardedPort[]> => {
  try {
    // get the active port-forwards to update the status
    const activePortForwards = await getActivePortForwards(clusterId);

    portForwardStore.portForwards.map((item, index) => {
      if (activePortForwards.find(portForwardsEqual(item)) && portForwardStore.portForwards[index].status !== "Active") {
        portForwardStore.portForwards[index].status = "Active";
      } else if (portForwardStore.portForwards[index].status !== "Disabled") {
        portForwardStore.portForwards[index].status = "Disabled";
      }
    });
  } catch (error) {
    logger.warn("[PORT-FORWARD-STORE] Error getting all active port-forwards:", error);
  }

  return portForwardStore.portForwards;
});

export const portForwardStore = new PortForwardStore();
