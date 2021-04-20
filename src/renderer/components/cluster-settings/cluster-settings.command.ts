import { navigate } from "../../navigation";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { clusterStore } from "../../../common/cluster-store";
import { entitySettingsURL } from "../+entity-settings";

commandRegistry.add({
  id: "cluster.viewCurrentClusterSettings",
  title: "Cluster: View Settings",
  scope: "global",
  action: () => navigate(entitySettingsURL({
    params: {
      entityId: clusterStore.active.id
    }
  })),
  isActive: (context) => !!context.entity
});
