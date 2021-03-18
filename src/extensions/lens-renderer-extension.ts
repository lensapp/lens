import type { AppPreferenceRegistration, ClusterFeatureRegistration, ClusterPageMenuRegistration, KubeObjectDetailRegistration, KubeObjectMenuRegistration, KubeObjectStatusRegistration, PageMenuRegistration, PageRegistration, StatusBarRegistration, } from "./registries";
import { Cluster } from "../main/cluster";
import { LensExtension } from "./lens-extension";
import { getExtensionPageUrl } from "./registries/page-registry";
import { CommandRegistration } from "./registries/command-registry";
import { clusterViewURL } from "../renderer/components/cluster-manager/cluster-view.route";
import { workspaceStore } from "../common/workspace-store";
import logger from "../main/logger";
import { ClusterId, clusterStore } from "../common/cluster-store";

export class LensRendererExtension extends LensExtension {
  globalPages: PageRegistration[] = [];
  clusterPages: PageRegistration[] = [];
  globalPageMenus: PageMenuRegistration[] = [];
  clusterPageMenus: ClusterPageMenuRegistration[] = [];
  kubeObjectStatusTexts: KubeObjectStatusRegistration[] = [];
  appPreferences: AppPreferenceRegistration[] = [];
  clusterFeatures: ClusterFeatureRegistration[] = [];
  statusBarItems: StatusBarRegistration[] = [];
  kubeObjectDetailItems: KubeObjectDetailRegistration[] = [];
  kubeObjectMenuItems: KubeObjectMenuRegistration[] = [];
  commands: CommandRegistration[] = [];

  async navigate<P extends object>(pageId?: string, params?: P) {
    const { navigate } = await import("../renderer/navigation");
    const pageUrl = getExtensionPageUrl({
      extensionId: this.name,
      pageId,
      params: params ?? {}, // compile to url with params
    });

    navigate(pageUrl);
  }

  async activateCluster(clusterOrId: ClusterId | Cluster): Promise<void> {
    const { navigate } = await import("../renderer/navigation");
    const cluster = typeof clusterOrId === "string"
      ? clusterStore.getById(clusterOrId)
      : clusterOrId;

    if (!(cluster instanceof Cluster)) {
      return void logger.warn(`[${this.name.toUpperCase()}]: tried to activate a cluster. Provided invalid ID or not a cluster`, { clusterOrId });
    }

    workspaceStore.getById(cluster.workspace).setActiveCluster(cluster);
    navigate(clusterViewURL({ params: { clusterId: cluster.id } }));
  }

  /**
   * Defines if extension is enabled for a given cluster. Defaults to `true`.
   */
  async isEnabledForCluster(cluster: Cluster): Promise<Boolean> {
    return (void cluster) || true;
  }
}
