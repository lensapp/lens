import { navigate } from "../../navigation";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { entitySettingsURL } from "../+entity-settings";
import { ClusterStore } from "../../../common/cluster-store";

commandRegistry.add({
  id: "cluster.viewCurrentClusterSettings",
  title: "Cluster: View Settings",
  scope: "global",
  action: () => navigate(entitySettingsURL({
    params: {
      entityId: ClusterStore.getInstance().active.id
    }
  })),
  isActive: (context) => !!context.entity
});
