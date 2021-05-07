// Cleans up a store that had the state related data stored
import { Hotbar } from "../../common/hotbar-store";
import { ClusterStore } from "../../common/cluster-store";
import { migration } from "../migration-wrapper";
import { v4 as uuid } from "uuid";

export default migration({
  version: "5.0.0-alpha.0",
  run(store) {
    const hotbars: Hotbar[] = [];

    ClusterStore.getInstance().clustersList.forEach((cluster: any) => {
      const name = cluster.workspace;

      if (!name) return;

      let hotbar = hotbars.find((h) => h.name === name);

      if (!hotbar) {
        hotbar = { id: uuid(), name, items: [] };
        hotbars.push(hotbar);
      }

      hotbar.items.push({
        entity: { uid: cluster.id },
        params: {}
      });
    });

    store.set("hotbars", hotbars);
  }
});
