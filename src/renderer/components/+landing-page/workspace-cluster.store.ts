import { WorkspaceId } from "../../../common/workspace-store";
import { Cluster } from "../../../main/cluster";
import { clusterStore } from "../../../common/cluster-store";
import { ItemObject, ItemStore } from "../../item.store";
import { autobind } from "../../utils";
import { computed, reaction } from "mobx";

export class ClusterItem implements ItemObject {
  constructor(public cluster: Cluster) {}

  get name() {
    return this.cluster.name;
  }

  get distribution() {
    return this.cluster.metadata?.distribution?.toString() ?? "unknown";
  }

  get version() {
    return this.cluster.version;
  }

  get connectionStatus() {
    return this.cluster.online ? "connected" : "disconnected";
  }

  getName() {
    return this.name;
  }

  get id() {
    return this.cluster.id;
  }

  get clusterId() {
    return this.cluster.id;
  }

  getId() {
    return this.id;
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

  @computed get clusters(): ClusterItem[] {
    return clusterStore
      .getByWorkspaceId(this.workspaceId)
      .filter(cluster => cluster.enabled)
      .map(cluster => new ClusterItem(cluster));
  }

  watch() {
    return reaction(() => this.clusters, () => this.loadAll(), {
      fireImmediately: true
    });
  }

  loadAll() {
    return this.loadItems(() => this.clusters);
  }

  async remove(clusterItem: ClusterItem) {
    const { cluster: { isManaged, id: clusterId }} = clusterItem;

    if (!isManaged) {
      return super.removeItem(clusterItem, () => clusterStore.removeById(clusterId));
    }
  }
}
