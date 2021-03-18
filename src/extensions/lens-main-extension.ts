import type { MenuRegistration } from "./registries/menu-registry";
import { LensExtension } from "./lens-extension";
import { WindowManager } from "../main/window-manager";
import { getExtensionPageUrl } from "./registries/page-registry";
import { Cluster } from "../main/cluster";
import { ClusterId, clusterStore } from "../common/cluster-store";
import logger from "../main/logger";
import { workspaceStore } from "../common/workspace-store";
import { clusterViewURL } from "../renderer/components/cluster-manager/cluster-view.route";

export class LensMainExtension extends LensExtension {
  appMenus: MenuRegistration[] = [];

  async navigate<P extends object>(pageId?: string, params?: P, frameId?: number) {
    const windowManager = WindowManager.getInstance<WindowManager>();
    const pageUrl = getExtensionPageUrl({
      extensionId: this.name,
      pageId,
      params: params ?? {}, // compile to url with params
    });

    await windowManager.navigate(pageUrl, frameId);
  }

  async activateCluster(clusterOrId: ClusterId | Cluster): Promise<void> {
    const windowManager = WindowManager.getInstance<WindowManager>();
    const cluster = typeof clusterOrId === "string"
      ? clusterStore.getById(clusterOrId)
      : clusterOrId;

    if (!(cluster instanceof Cluster)) {
      return void logger.warn(`[${this.name.toUpperCase()}]: tried to activate a cluster. Provided invalid ID or not a cluster`, { clusterOrId });
    }

    workspaceStore.getById(cluster.workspace).setActiveCluster(cluster);
    await windowManager.navigate(clusterViewURL({ params: { clusterId: cluster.id }}));
  }
}
