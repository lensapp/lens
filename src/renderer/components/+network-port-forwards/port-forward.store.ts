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
import { ItemObject, ItemStore } from "../../../common/item.store";
import { autoBind, createStorage, delay } from "../../utils";
import { apiBase } from "../../api";
import { waitUntilFree } from "tcp-port-used";
import { getHostedClusterId } from "../../utils";
import { podsApi } from "../../../common/k8s-api/endpoints";

interface PortForwardResult {
  port: number;
}

interface ForwardedPort {
  clusterId: string;
  kind: string;
  namespace: string;
  name: string;
  port: string;
  forwardPort: string;
}

interface PortForwardsResult {
  portForwards: ForwardedPort[];
}

export class PortForwardItem implements ItemObject {
  clusterId: string;
  kind: string;
  namespace: string;
  name: string;
  port: string;
  forwardPort: string;

  interval: NodeJS.Timeout;

  constructor() {
    autoBind(this);
  }

  getName() {
    return this.name;
  }

  getNs() {
    return this.namespace;
  }
 
  get id() {
    return this.forwardPort;
  }
 
  getId() {
    return this.forwardPort;
  }

  getKind() {
    return this.kind;
  }

   getPort() {
     return this.port;
   }

   getForwardPort() {
    return this.forwardPort;
  }

  getSearchFields() {
    return [
      this.name,
      this.id,
      this.kind,
      this.port,
      this.forwardPort,
    ];
  }

  monitor() {
      // for now only support pods
      if (this.kind === "pod") {
      this.interval = setInterval( this.keepAlive, 5000);
    }
  }

  async keepAlive() {
    console.log("keepAlive() called");
    let pod = await podsApi.get({name: this.getName(), namespace: this.getNs()});
    if (!pod || pod.metadata.deletionTimestamp) {
      console.log("keepAlive() pod lost!");
      clearInterval(this.interval);
      this.interval = undefined;
      // wait for resource
      while (true) {
        await delay(1000);
        pod = await podsApi.get({name: this.getName(), namespace: this.getNs()});
        if (pod) {
          if (pod.getContainerStatuses()?.[0]?.ready) {
            console.log("keepAlive() pod found!");
            // restart port forward
            await portForwardStore.modify(this, +this.getForwardPort());
            break;
          }
        }
      }
    } 
  }
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
        return this.add(port);
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
      const response = await apiBase.get<PortForwardsResult>(`/port-forwards`, {});

      const portForwards = response.portForwards?.filter(pf => pf.clusterId == getHostedClusterId());
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
        port.monitor();
        this.portForwards.push(port);
      })
      return this.portForwards;
    });
  }

  reset() {
    this.portForwards?.forEach(pf => {
      if (pf.interval) clearInterval(pf.interval)
    });
    this.portForwards = [];
  }

  async add(portForward: PortForwardItem) {
    await add(portForward);
    this.reset();
  }

  async modify(portForward: PortForwardItem, desiredPort: number) {
    await remove(portForward);
    portForward.forwardPort = desiredPort.toString();
    await add(portForward);
    this.reset();
  }

  async remove(portForward: PortForwardItem) {
    await remove(portForward);
    this.reset();
  }
 
  async removeSelectedItems() {
    return Promise.all(this.selectedItems.map(this.remove));
  }
}

async function add(portForward: PortForwardItem) {
  const response = await apiBase.post<PortForwardResult>(`/pods/${portForward.getNs()}/${portForward.getKind()}/${portForward.getName()}/port-forward/${portForward.getPort()}/${portForward.getForwardPort()}`, {});
  if (response?.port != +portForward.getForwardPort() ) {
    console.log(`specified ${portForward.getForwardPort()} got ${response.port}`);
  }
}

async function remove(portForward: PortForwardItem) {
  await apiBase.del(`/pods/${portForward.getNs()}/${portForward.getKind()}/${portForward.getName()}/port-forward/${portForward.getPort()}/${portForward.forwardPort}`, {})
  await waitUntilFree(+portForward.getForwardPort(), 200, 1000);
}

export const portForwardStore = new PortForwardStore();
