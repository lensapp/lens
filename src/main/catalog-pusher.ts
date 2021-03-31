import { autorun, toJS } from "mobx";
import { broadcastMessage, subscribeToBroadcast } from "../common/ipc";
import { CatalogEntityRegistry} from "../common/catalog-entity-registry";
import "../common/catalog-entities/kubernetes-cluster";

export class CatalogPusher {
  static init(catalog: CatalogEntityRegistry) {
    new CatalogPusher(catalog).init();
  }

  constructor(private catalog: CatalogEntityRegistry) {}

  init() {
    autorun(() => {
      this.broadcast();
    });

    subscribeToBroadcast("catalog:broadcast", () => {
      this.broadcast();
    });
  }

  broadcast() {
    console.log("BROADCAST");
    broadcastMessage("catalog:items", toJS(this.catalog.items, { recurseEverything: true }));
  }
}
