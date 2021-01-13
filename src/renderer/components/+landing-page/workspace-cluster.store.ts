import { WorkspaceId } from "../../../common/workspace-store";
import { Cluster } from "../../../main/cluster";
import { clusterStore } from "../../../common/cluster-store";
import { ItemObject, ItemStore } from "../../item.store";
import { autobind } from "../../utils";

export class ClusterItem implements ItemObject {
  cluster: Cluster;

  getName() {
    return this.cluster.name;
  }

  getId() {
    return this.cluster.id;
  }
}

/** an ItemStore of the clusters belonging to a given workspace */
@autobind()
export class WorkspaceClusterStore extends ItemStore<ClusterItem> {

  workspaceId: WorkspaceId;

  constructor(workspaceId: WorkspaceId) {
    super();
    this.workspaceId = workspaceId;
  }

  loadAll() {
    return this.loadItems(() => clusterStore.getByWorkspaceId(this.workspaceId).map(cluster => {
      const clusterItem = new ClusterItem();

      clusterItem.cluster = cluster;

      return clusterItem;
    }));
  }

  async remove(clusterItem: ClusterItem) {
    const { cluster } = clusterItem;

    if (cluster.isManaged) {
      return;
    }

    const clusterId = cluster.id;

    return super.removeItem(clusterItem, async () => {
      if (clusterStore.activeClusterId === clusterId) {
        clusterStore.setActive(null);
      }
      clusterStore.removeById(clusterId);
    });
  }
  
  async removeSelectedItems() {
    if (!this.selectedItems.length) {
      return;
    }
    
    return Promise.all(this.selectedItems.map(this.remove));
  }
}
