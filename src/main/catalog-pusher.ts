import { reaction, toJS } from "mobx";
import { broadcastMessage, subscribeToBroadcast, unsubscribeFromBroadcast } from "../common/ipc";
import { CatalogEntityRegistry} from "../common/catalog";
import "../common/catalog-entities/kubernetes-cluster";
import { Disposer } from "../common/utils";

export class CatalogPusher {
  static init(catalog: CatalogEntityRegistry) {
    new CatalogPusher(catalog).init();
  }

  private constructor(private catalog: CatalogEntityRegistry) {}

  init() {
    const disposers: Disposer[] = [];

    disposers.push(reaction(() => this.catalog.items, (items) => {
      broadcastMessage("catalog:items", toJS(items, { recurseEverything: true }));
    }, {
      fireImmediately: true,
    }));

    const listener = subscribeToBroadcast("catalog:broadcast", () => {
      broadcastMessage("catalog:items", toJS(this.catalog.items, { recurseEverything: true }));
    });

    disposers.push(() => unsubscribeFromBroadcast("catalog:broadcast", listener));

    return disposers;
  }
}
