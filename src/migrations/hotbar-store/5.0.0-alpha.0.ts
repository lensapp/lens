// Cleans up a store that had the state related data stored
import { Hotbar } from "../../common/hotbar-store";
import { clusterStore } from "../../common/cluster-store";
import { migration } from "../migration-wrapper";

export default migration({
  version: "5.0.0-alpha.0",
  run(store) {
    const hotbars: Hotbar[] = [];

    clusterStore.enabledClustersList.forEach((cluster: any) => {
      const name = cluster.workspace || "default";
      let hotbar = hotbars.find((h) => h.name === name);

      if (!hotbar) {
        hotbar = { name, items: [] };
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
