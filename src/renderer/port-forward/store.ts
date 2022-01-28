/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, makeObservable, reaction } from "mobx";
import { ItemStore } from "../../common/item.store";
import { autoBind, disposer, StorageLayer } from "../utils";
import { ForwardedPort, PortForwardItem } from "./port-forward";
import { notifyErrorPortForwarding } from "./notify";
import { apiBase } from "../api";
import { waitUntilFree } from "tcp-port-used";
import logger from "../../common/logger";
import { portForwardsEqual } from "./utils";

export interface PortForwardStoreDependencies {
  storage: StorageLayer<ForwardedPort[] | undefined>;
}

interface PortForwardResult {
  port: number;
}

async function getActivePortForward(portForward: ForwardedPort): Promise<ForwardedPort> {
  const { port, forwardPort } = portForward;
  let response: PortForwardResult;

  try {
    response = await apiBase.get<PortForwardResult>(
      `/pods/port-forward/${portForward.namespace}/${portForward.kind}/${portForward.name}`,
      { query: { port, forwardPort }},
    );
  } catch (error) {
    logger.warn(`[PORT-FORWARD-STORE] Error getting active port-forward: ${error}`, portForward);
  }

  portForward.status = response?.port ? "Active" : "Disabled";
  portForward.forwardPort = response?.port;

  return portForward;
}

export class PortForwardStore extends ItemStore<PortForwardItem> {
  constructor(protected readonly dependencies: PortForwardStoreDependencies) {
    super();
    makeObservable(this);
    autoBind(this);

    this.init();
  }

  private async init() {
    const savedPortForwards = this.dependencies.storage.get(); // undefined on first load

    if (Array.isArray(savedPortForwards) && savedPortForwards.length > 0) {
      logger.info("[PORT-FORWARD-STORE] starting saved port-forwards");

      // add the disabled ones
      await Promise.all(savedPortForwards.filter(pf => pf.status === "Disabled").map(this.addPortForward));

      // add the active ones (assume active if the status is undefined, for backward compatibilty) and check if they started successfully
      const results = await Promise.allSettled(savedPortForwards.filter(pf => !pf.status || pf.status === "Active").map(this.addPortForward));

      for (const result of results) {
        if (result.status === "rejected" || result.value.status === "Disabled") {
          return notifyErrorPortForwarding("One or more port-forwards could not be started");
        }
      }
    }
  }

  watch() {
    return disposer(
      reaction(() => this.items.slice(), () => this.loadAll()),
    );
  }

  loadAll() {
    return this.loadItems(() => {
      const portForwards = this.items;

      this.dependencies.storage.set(portForwards);

      return this.items.replace(portForwards.map(pf => new PortForwardItem(pf)));
    });
  }

  removeSelectedItems() {
    return Promise.all(this.selectedItems.map(this.removePortForward));
  }

  getById(id: string) {
    const index = this.getIndexById(id);

    if (index === -1) {
      return null;
    }

    return this.getItems()[index];
  }

  private findPortForward = (portForward: ForwardedPort) => {
    return this.items.find(portForwardsEqual(portForward));
  };

  private setPortForward = action((portForward: ForwardedPort) => {
    const index = this.items.findIndex(portForwardsEqual(portForward));

    if (index < 0) {
      return;
    }

    this.items[index] = new PortForwardItem(portForward);
  });


  /**
   * start an existing port-forward
   * @param portForward the port-forward to start. If the forwardPort field is 0 then an arbitrary port will be
   * used
   *
   * @returns the port-forward with updated status ("Active" if successfully started, "Disabled" otherwise) and
   * forwardPort
   *
   * @throws if the port-forward does not already exist in the store
   */
  startPortForward = action(async (portForward: ForwardedPort): Promise<ForwardedPort> => {
    const pf = this.findPortForward(portForward);

    if (!pf) {
      throw new Error("cannot start non-existent port-forward");
    }

    const { port, forwardPort } = pf;

    try {
      const response = await apiBase.post<PortForwardResult>(
        `/pods/port-forward/${pf.namespace}/${pf.kind}/${pf.name}`,
        { query: { port, forwardPort }},
      );

      // expecting the received port to be the specified port, unless the specified port is 0, which indicates any available port is suitable
      if (pf.forwardPort && response?.port && response.port != +pf.forwardPort) {
        logger.warn(`[PORT-FORWARD-STORE] specified ${pf.forwardPort}, got ${response.port}`);
      }

      pf.forwardPort = response.port;
      pf.status = "Active";

    } catch (error) {
      logger.warn(`[PORT-FORWARD-STORE] Error starting port-forward: ${error}`, pf);
      pf.status = "Disabled";
    }

    this.setPortForward(pf);

    return pf;
  });

  /**
   * add a port-forward to the store and optionally start it
   * @param portForward the port-forward to add. If the port-forward already exists in the store it will be
   * returned with its current state. If the forwardPort field is 0 then an arbitrary port will be
   * used. If the status field is "Active" or not present then an attempt is made to start the port-forward.
   *
   * @returns the port-forward with updated status ("Active" if successfully started, "Disabled" otherwise) and
   * forwardPort
   */
  addPortForward = action(async (portForward: ForwardedPort): Promise<ForwardedPort> => {
    const pf = this.findPortForward(portForward);

    if (pf) {
      return pf;
    }

    this.items.push(new PortForwardItem(portForward));

    if (!portForward.status) {
      portForward.status = "Active";
    }

    if (portForward.status === "Active") {
      portForward = await this.startPortForward(portForward);
    }

    return portForward;
  });

  /**
   * get a port-forward from the store, with up-to-date status
   * @param portForward the port-forward to get.
   *
   * @returns the port-forward with updated status ("Active" if running, "Disabled" if not) and
   * forwardPort used.
   *
   * @throws if the port-forward does not exist in the store
   */
  getPortForward = async (portForward: ForwardedPort): Promise<ForwardedPort> => {
    if (!this.findPortForward(portForward)) {
      throw new Error("port-forward not found");
    }

    let pf: ForwardedPort;

    try {
      // check if the port-forward is active, and if so check if it has the same local port
      pf = await getActivePortForward(portForward);

      if (pf.forwardPort && pf.forwardPort !== portForward.forwardPort) {
        logger.warn(`[PORT-FORWARD-STORE] local port, expected ${pf.forwardPort}, got ${portForward.forwardPort}`);
      }
    } catch (error) {
      // port is not active
    }

    return pf;
  };

  /**
   * modifies a port-forward in the store, including the forwardPort and protocol
   * @param portForward the port-forward to modify.
   *
   * @returns the port-forward after being modified.
   */
  modifyPortForward = action(async (portForward: ForwardedPort, desiredPort: number): Promise<ForwardedPort> => {
    const pf = this.findPortForward(portForward);

    if (!pf) {
      throw new Error("port-forward not found");
    }

    if (pf.status === "Active") {
      try {
        await this.stopPortForward(pf);
      } catch {
        // ignore, assume it is stopped and proceed to restart it
      }

      pf.forwardPort = desiredPort;
      pf.protocol = portForward.protocol ?? "http";
      this.setPortForward(pf);

      return this.startPortForward(pf);
    }

    pf.forwardPort = desiredPort;
    this.setPortForward(pf);

    return pf;
  });

  /**
   * stop an existing port-forward. Its status is set to "Disabled" after successfully stopped.
   * @param portForward the port-forward to stop.
   *
   * @throws if the port-forward could not be stopped. Its status is unchanged
   */
  stopPortForward = action(async (portForward: ForwardedPort) => {
    const pf = this.findPortForward(portForward);

    if (!pf) {
      return void logger.warn("[PORT-FORWARD-STORE] Error getting port-forward: port-forward not found", portForward);
    }

    const { port, forwardPort } = portForward;

    try {
      await apiBase.del(`/pods/port-forward/${portForward.namespace}/${portForward.kind}/${portForward.name}`, { query: { port, forwardPort }});
      await waitUntilFree(+forwardPort, 200, 1000);
    } catch (error) {
      logger.warn(`[PORT-FORWARD-STORE] Error stopping active port-forward: ${error}`, portForward);
      throw (error);
    }

    pf.status = "Disabled";
    this.setPortForward(pf);
  });

  /**
   * remove and stop an existing port-forward.
   * @param portForward the port-forward to remove.
   */
  removePortForward = action(async (portForward: ForwardedPort) => {
    const pf = this.findPortForward(portForward);

    if (!pf) {
      return void logger.warn(`[PORT-FORWARD-STORE] Error getting port-forward: port-forward not found`, portForward);
    }

    try {
      await this.stopPortForward(portForward);
    } catch (error) {
      if (pf.status === "Active") {
        logger.warn(`[PORT-FORWARD-STORE] Error removing port-forward: ${error}`, portForward);
      }
    }

    const index = this.items.findIndex(portForwardsEqual(portForward));

    if (index >= 0 ) {
      this.items.splice(index, 1);
    }
  });
}
