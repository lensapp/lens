import type { AppPreferenceRegistration, ClusterFeatureRegistration, ClusterPageMenuRegistration, KubeObjectDetailRegistration, KubeObjectMenuRegistration, KubeObjectStatusRegistration, PageMenuRegistration, PageRegistration, StatusBarRegistration, } from "./registries";
import type { Cluster } from "../main/cluster";
import { LensExtension } from "./lens-extension";
import { getExtensionPageUrl } from "./registries/page-registry";
import { CommandRegistration } from "./registries/command-registry";

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

  /**
   * Defines if extension is enabled for a given cluster. Defaults to `true`.
   */
  // eslint-disable-next-line unused-imports/no-unused-vars-ts
  async isEnabledForCluster(cluster: Cluster): Promise<Boolean> {
    return true;
  }
}
