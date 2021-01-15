import { WorkspaceId } from "../../../common/workspace-store";
import { Cluster } from "../../../main/cluster";
import { clusterStore } from "../../../common/cluster-store";
import { ItemStore } from "../../item.store";

export class ClusterItem {
    cluster: Cluster;

    getName() {
        return this.cluster.name;
    }

    getId() {
        return this.cluster.id
    }
}

/** an ItemStore of the clusters belonging to a given workspace */
export class WorkspaceClusterStore extends ItemStore<ClusterItem> {

    workspaceId: WorkspaceId;

    constructor(workspaceId: WorkspaceId) {
        super();
        this.workspaceId = workspaceId;
    }

    loadAll() {
        return this.loadItems(() => clusterStore.getByWorkspaceId(this.workspaceId).map(cluster => {
            let clusterItem = new ClusterItem();
            clusterItem.cluster = cluster;
            return clusterItem;
        }));
      }
}