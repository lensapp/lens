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

    disposers.push(reaction(() => toJS(this.catalog.items, { recurseEverything: true }), (items) => {
      broadcastMessage("catalog:items", items);
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
