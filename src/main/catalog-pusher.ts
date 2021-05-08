import { reaction } from "mobx";
import { broadcastMessage, subscribeToBroadcast, unsubscribeFromBroadcast } from "../common/ipc";
import { CatalogEntityRegistry } from "../common/catalog";
import "../common/catalog-entities/kubernetes-cluster";
import { Disposer } from "../common/utils";

export class CatalogPusher {
  static init(catalog: CatalogEntityRegistry) {
    new CatalogPusher(catalog).init();
  }

  private constructor(private catalog: CatalogEntityRegistry) {
  }

  init() {
    const disposers: Disposer[] = [
      reaction(
        () => this.catalog.items,
        (items) => broadcastMessage("catalog:items", items),
        { fireImmediately: true }
      ),
    ];

    const listener = subscribeToBroadcast("catalog:broadcast", () => {
      broadcastMessage("catalog:items", this.catalog.items);
    });

    disposers.push(() => unsubscribeFromBroadcast("catalog:broadcast", listener));

    return disposers;
  }
}
