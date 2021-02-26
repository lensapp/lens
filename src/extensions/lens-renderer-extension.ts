import { AppPreferenceRegistration, ClusterFeatureRegistration, ClusterPageMenuRegistration, KubeObjectDetailRegistration, KubeObjectMenuRegistration, KubeObjectStatusRegistration, PageMenuRegistration, PageRegistration, getRegisteredPage, Registrable, StatusBarRegistration, recitfyRegisterable, getRegisteredPageMenu, } from "./registries";
import type { Cluster } from "../main/cluster";
import { LensExtension } from "./lens-extension";
import { getExtensionPageUrl } from "./registries/page-registry";
import { CommandRegistration } from "./registries/command-registry";
import { computed, observable } from "mobx";
import { getHostedCluster } from "../common/cluster-store";

export const registeredClusterPages = Symbol("registeredClusterPages");
export const registeredGlobalPages = Symbol("registeredGlobalPages");
export const registeredGlobalPageMenus = Symbol("registeredGlobalPageMenus");
export const registeredClusterPageMenus = Symbol("registeredClusterPageMenus");

export class LensRendererExtension extends LensExtension {
  #privateGetters = {
    [registeredGlobalPages]: computed(() => (
      recitfyRegisterable(this.globalPages)
        .map(page => getRegisteredPage(page, this.name))
    )),
    [registeredClusterPages]: computed(() => (
      recitfyRegisterable(this.clusterPages, getHostedCluster)
        .map(page => getRegisteredPage(page, this.name))
    )),
    [registeredGlobalPageMenus]: computed(() => (
      recitfyRegisterable(this.globalPageMenus)
        .map(pageMenu => getRegisteredPageMenu(pageMenu, this.name))
    )),
    [registeredClusterPageMenus]: computed(() => (
      recitfyRegisterable(this.clusterPageMenus, getHostedCluster)
        .map(pageMenu => getRegisteredPageMenu(pageMenu, this.name))
    )),
  };

  @observable globalPages: Registrable<PageRegistration> = [];
  get [registeredGlobalPages]() {
    return this.#privateGetters[registeredGlobalPages].get();
  }

  @observable clusterPages: Registrable<PageRegistration> = [];
  get [registeredClusterPages]() {
    return this.#privateGetters[registeredClusterPages].get();
  }

  @observable globalPageMenus: Registrable<PageMenuRegistration> = [];
  get [registeredGlobalPageMenus]() {
    return this.#privateGetters[registeredGlobalPageMenus].get();
  }

  @observable clusterPageMenus: Registrable<ClusterPageMenuRegistration> = [];
  get [registeredClusterPageMenus]() {
    return this.#privateGetters[registeredClusterPageMenus].get();
  }

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
      extensionName: this.name,
      pageId,
      params: params ?? {}, // compile to url with params
    });

    navigate(pageUrl);
  }

  /**
   * Defines if extension is enabled for a given cluster. Defaults to `true`.
   */
  async isEnabledForCluster(cluster: Cluster): Promise<Boolean> {
    return (void cluster) || true;
  }
}
