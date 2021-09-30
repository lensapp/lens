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


import { computed, IReactionDisposer, makeObservable, observable, reaction } from "mobx";
import { ItemObject, ItemStore } from "../../common/item.store";
import { autoBind, createStorage } from "../utils";
import { getHostedClusterId } from "../utils";
import { PortForwardItem } from "./port-forward-item";
import { apiBase } from "../api";
import { waitUntilFree } from "tcp-port-used";

export interface ForwardedPort {
  clusterId: string;
  kind: string;
  namespace: string;
  name: string;
  port: string;
  forwardPort: string;
}

export class PortForwardStore extends ItemStore<PortForwardItem> {
  private storage = createStorage<ForwardedPort[] | undefined>("port_forwards", undefined);

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
      await Promise.all(savedPortForwards.map(pf => {
        const port = new PortForwardItem;

        port.clusterId = pf.clusterId;
        port.kind = pf.kind;
        port.namespace = pf.namespace;
        port.name = pf.name;
        port.port = pf.port;
        port.forwardPort = pf.forwardPort;

        return addPortForward(port);
      }));

      this.portForwards = [];
    }
  }

  @observable selectedItemId?: string;
  @observable portForwards: PortForwardItem[];

  @computed get selectedItem() {
    return this.portForwards.find((e: ItemObject) => e.getId() === this.selectedItemId);
  }

  watch() {
    const disposers: IReactionDisposer[] = [
      reaction(() => this.portForwards, () => this.loadAll()),
    ];

    return () => disposers.forEach((dispose) => dispose());
  }

  loadAll() {
    return this.loadItems(async () => {
      let portForwards = await getPortForwards();

      // filter out any not for this cluster
      portForwards = portForwards?.filter(pf => pf.clusterId == getHostedClusterId());
      this.storage.set(portForwards);

      this.reset();
      portForwards?.forEach(pf => {
        const port = new PortForwardItem;

        port.clusterId = pf.clusterId;
        port.kind = pf.kind;
        port.namespace = pf.namespace;
        port.name = pf.name;
        port.port = pf.port;
        port.forwardPort = pf.forwardPort;
        this.portForwards.push(port);
      });

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

export async function addPortForward(portForward: PortForwardItem): Promise<number> {
  let response;

  try {
    response = await apiBase.post<PortForwardResult>(`/pods/${portForward.getNs()}/${portForward.getKind()}/${portForward.getName()}/port-forward/${portForward.getPort()}/${portForward.getForwardPort()}`, {});
    
    if (response?.port != +portForward.getForwardPort()) {
      console.log(`specified ${portForward.getForwardPort()} got ${response.port}`);
    }
  } catch (error) {
    console.error(error);
  }
  portForwardStore.reset();

  return response?.port;
}

export async function modifyPortForward(portForward: PortForwardItem, desiredPort: number) {
  try {
    await removePortForward(portForward);
    portForward.forwardPort = desiredPort.toString();
    await addPortForward(portForward);
  } catch (error) {
    console.error(error);
  }
  portForwardStore.reset();
}


export async function removePortForward(portForward: PortForwardItem) {
  try {
    await apiBase.del(`/pods/${portForward.getNs()}/${portForward.getKind()}/${portForward.getName()}/port-forward/${portForward.getPort()}/${portForward.forwardPort}`, {});
    await waitUntilFree(+portForward.getForwardPort(), 200, 1000);
  } catch (error) {
    console.error(error);
  }
  portForwardStore.reset();
}

export async function getPortForwards(): Promise<ForwardedPort[]> {
  try {
    const response = await apiBase.get<PortForwardsResult>(`/port-forwards`, {});

    return response.portForwards;
  } catch (error) {
    console.error(error);
    
    return [];
  }
}

export const portForwardStore = new PortForwardStore();
