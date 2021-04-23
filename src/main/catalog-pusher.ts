import { autorun, toJS } from "mobx";
import { broadcastMessage, subscribeToBroadcast, unsubscribeFromBroadcast } from "../common/ipc";
import { CatalogEntityRegistry} from "../common/catalog";
import "../common/catalog-entities/kubernetes-cluster";

export class CatalogPusher {
  static init(catalog: CatalogEntityRegistry) {
    new CatalogPusher(catalog).init();
  }

  private constructor(private catalog: CatalogEntityRegistry) {}

  init() {
    const disposers: { (): void; }[] = [];

    disposers.push(autorun(() => {
      this.broadcast();
    }));

    const listener = subscribeToBroadcast("catalog:broadcast", () => {
      this.broadcast();
    });

    disposers.push(() => unsubscribeFromBroadcast("catalog:broadcast", listener));

    return disposers;
  }

  broadcast() {
    broadcastMessage("catalog:items", toJS(this.catalog.items, { recurseEverything: true }));
  }
}
