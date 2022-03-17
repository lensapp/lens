/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, makeObservable, observable, reaction } from "mobx";
import { ItemStore } from "../../../common/item.store";
import type { StorageHelper } from "../../utils";
import { autoBind, disposer } from "../../utils";
import type { ForwardedPort } from "../port-forward-item";
import { PortForwardItem } from "../port-forward-item";
import { apiBase } from "../../api";
import { waitUntilFree } from "tcp-port-used";
import logger from "../../../common/logger";

interface Dependencies {
  storage: StorageHelper<ForwardedPort[] | undefined>;
  notifyErrorPortForwarding: (message: string) => void;
}

export class PortForwardStore extends ItemStore<PortForwardItem> {
  @observable portForwards: PortForwardItem[] = [];

  constructor(private dependencies: Dependencies) {
    super();
    makeObservable(this);
    autoBind(this);

    this.init();
  }

  private async init() {
    await this.dependencies.storage.whenReady;

    const savedPortForwards = this.dependencies.storage.get(); // undefined on first load

    if (Array.isArray(savedPortForwards) && savedPortForwards.length > 0) {
      logger.info("[PORT-FORWARD-STORE] starting saved port-forwards");

      // add the disabled ones
      await Promise.all(savedPortForwards.filter(pf => pf.status === "Disabled").map(this.add));

      // add the active ones (assume active if the status is undefined, for backward compatibility) and check if they started successfully
      const results = await Promise.allSettled(savedPortForwards.filter(pf => !pf.status || pf.status === "Active").map(this.add));

      for (const result of results) {
        if (result.status === "rejected" || result.value.status === "Disabled") {
          this.dependencies.notifyErrorPortForwarding("One or more port-forwards could not be started");

          return;
        }
      }
    }
  }

  watch() {
    return disposer(
      reaction(
        () => this.portForwards.slice(),
        () => this.loadAll(),
      ),
    );
  }

  loadAll() {
    return this.loadItems(() => {
      const portForwards = this.getPortForwards();

      this.dependencies.storage.set(portForwards);

      this.portForwards = [];
      portForwards.map((pf) => this.portForwards.push(new PortForwardItem(pf)));

      return this.portForwards;
    });
  }

  async removeItems(items: PortForwardItem[]) {
    await Promise.all(items.map(this.remove));
  }

  getById(id: string) {
    const index = this.getIndexById(id);

    if (index === -1) {
      return undefined;
    }

    return this.getItems()[index];
  }

  /**
   * add a port-forward to the store and optionally start it
   * @param portForward the port-forward to add. If the port-forward already exists in the store it will be
   * returned with its current state. If the forwardPort field is 0 then an arbitrary port will be
   * used. If the status field is "Active" or not present then an attempt is made to start the port-forward.
   *
   * @returns the port-forward with updated status ("Active" if successfully started, "Disabled" otherwise) and
   * forwardPort
   */
  add = action(async (portForward: ForwardedPort): Promise<ForwardedPort> => {
    const pf = this.findPortForward(portForward);

    if (pf) {
      return pf;
    }

    this.portForwards.push(new PortForwardItem(portForward));

    if (!portForward.status) {
      portForward.status = "Active";
    }

    if (portForward.status === "Active") {
      portForward = await this.start(portForward);
    }

    return portForward;
  });

  /**
   * modifies a port-forward in the store, including the forwardPort and protocol
   * @param portForward the port-forward to modify.
   *
   * @returns the port-forward after being modified.
   */
  modify = action(
    async (
      portForward: ForwardedPort,
      desiredPort: number,
    ): Promise<ForwardedPort> => {
      const pf = this.findPortForward(portForward);

      if (!pf) {
        throw new Error("port-forward not found");
      }

      if (pf.status === "Active") {
        try {
          await this.stop(pf);
        } catch {
          // ignore, assume it is stopped and proceed to restart it
        }

        pf.forwardPort = desiredPort;
        pf.protocol = portForward.protocol ?? "http";
        this.setPortForward(pf);

        return await this.start(pf);
      }

      pf.forwardPort = desiredPort;
      this.setPortForward(pf);

      return pf as ForwardedPort;
    },
  );

  /**
   * remove and stop an existing port-forward.
   * @param portForward the port-forward to remove.
   */
  remove = action(async (portForward: ForwardedPort) => {
    const pf = this.findPortForward(portForward);

    if (!pf) {
      const error = new Error("port-forward not found");

      logger.warn(
        `[PORT-FORWARD-STORE] Error getting port-forward: ${error}`,
        portForward,
      );

      return;
    }

    try {
      await this.stop(portForward);
    } catch (error) {
      if (pf.status === "Active") {
        logger.warn(
          `[PORT-FORWARD-STORE] Error removing port-forward: ${error}`,
          portForward,
        );
      }
    }

    const index = this.portForwards.findIndex(portForwardsEqual(portForward));

    if (index >= 0) {
      this.portForwards.splice(index, 1);
    }
  });

  /**
   * gets the list of port-forwards in the store
   *
   * @returns the port-forwards
   */
  getPortForwards = (): ForwardedPort[] => {
    return this.portForwards;
  };

  /**
   * stop an existing port-forward. Its status is set to "Disabled" after successfully stopped.
   * @param portForward the port-forward to stop.
   *
   * @throws if the port-forward could not be stopped. Its status is unchanged
   */
  stop = action(async (portForward: ForwardedPort) => {
    const pf = this.findPortForward(portForward);

    if (!pf) {
      logger.warn(
        "[PORT-FORWARD-STORE] Error getting port-forward: port-forward not found",
        portForward,
      );

      return;
    }

    const { port, forwardPort } = portForward;

    try {
      await apiBase.del(
        `/pods/port-forward/${portForward.namespace}/${portForward.kind}/${portForward.name}`,
        { query: { port, forwardPort }},
      );
      await waitUntilFree(+forwardPort, 200, 1000);
    } catch (error) {
      logger.warn(
        `[PORT-FORWARD-STORE] Error stopping active port-forward: ${error}`,
        portForward,
      );
      throw error;
    }

    pf.status = "Disabled";

    this.setPortForward(pf);
  });

  private findPortForward = (portForward: ForwardedPort) => {
    return this.portForwards.find(portForwardsEqual(portForward));
  };

  private setPortForward = action((portForward: ForwardedPort) => {
    const index = this.portForwards.findIndex(portForwardsEqual(portForward));

    if (index < 0) {
      return;
    }

    this.portForwards[index] = new PortForwardItem(portForward);
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
  start = action(async (portForward: ForwardedPort): Promise<ForwardedPort> => {
    const pf = this.findPortForward(portForward);

    if (!pf) {
      throw new Error("cannot start non-existent port-forward");
    }

    const { port, forwardPort } = pf;
    let response: PortForwardResult;

    try {
      response = await apiBase.post<PortForwardResult>(
        `/pods/port-forward/${pf.namespace}/${pf.kind}/${pf.name}`,
        { query: { port, forwardPort }},
      );

      // expecting the received port to be the specified port, unless the specified port is 0, which indicates any available port is suitable
      if (
        pf.forwardPort &&
        response?.port &&
        response.port != +pf.forwardPort
      ) {
        logger.warn(
          `[PORT-FORWARD-STORE] specified ${pf.forwardPort}, got ${response.port}`,
        );
      }

      pf.forwardPort = response.port;
      pf.status = "Active";
    } catch (error) {
      logger.warn(
        `[PORT-FORWARD-STORE] Error starting port-forward: ${error}`,
        pf,
      );
      pf.status = "Disabled";
    }

    this.setPortForward(pf);

    return pf as ForwardedPort;
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
  getPortForward = async (portForward: ForwardedPort): Promise<ForwardedPort | undefined> => {
    if (!this.findPortForward(portForward)) {
      throw new Error("port-forward not found");
    }

    try {
      // check if the port-forward is active, and if so check if it has the same local port
      const pf = await getActivePortForward(portForward);

      if (pf?.forwardPort && pf.forwardPort !== portForward.forwardPort) {
        logger.warn(
          `[PORT-FORWARD-STORE] local port, expected ${pf.forwardPort}, got ${portForward.forwardPort}`,
        );
      }

      return pf;
    } catch (error) {
      // port is not active
      return undefined;
    }
  };
}

interface PortForwardResult {
  port: number;
}

function portForwardsEqual(portForward: ForwardedPort) {
  return (pf: ForwardedPort) => (
    pf.kind == portForward.kind &&
    pf.name == portForward.name &&
    pf.namespace == portForward.namespace &&
    pf.port == portForward.port
  );
}

async function getActivePortForward(portForward: ForwardedPort): Promise<ForwardedPort | undefined> {
  const { port, forwardPort } = portForward;
  let response: PortForwardResult;

  try {
    response = await apiBase.get<PortForwardResult>(`/pods/port-forward/${portForward.namespace}/${portForward.kind}/${portForward.name}`, { query: { port, forwardPort }});
  } catch (error) {
    logger.warn(`[PORT-FORWARD-STORE] Error getting active port-forward: ${error}`, portForward);

    return undefined;
  }

  portForward.status = response?.port ? "Active" : "Disabled";
  portForward.forwardPort = response?.port;

  return portForward;
}
