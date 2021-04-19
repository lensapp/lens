import { AppPreferenceRegistration, ClusterPageMenuRegistration, KubeObjectDetailRegistration, KubeObjectMenuRegistration, KubeObjectStatusRegistration, PageMenuRegistration, PageRegistration, recitfyRegisterable, Registrable, StatusBarRegistration } from "./registries";
import { getRegisteredKubeObjectMenuItems } from "./registries/kube-object-menu-registry";
import type { Cluster } from "../main/cluster";
import { LensExtension } from "./lens-extension";
import { getExtensionPageUrl } from "./registries/page-registry";
import { CommandRegistration } from "./registries/command-registry";
import { computed, observable } from "mobx";

export const registeredKubeObjectMenuItems = Symbol("registeredKubeObjectMenuItems");

export class LensRendererExtension extends LensExtension {
  #privateGetters = {
    [registeredKubeObjectMenuItems]: computed(() => (
      recitfyRegisterable(this.kubeObjectMenuItems)
        .map(getRegisteredKubeObjectMenuItems)
    )),
  };

  globalPages: PageRegistration[] = [];
  clusterPages: PageRegistration[] = [];
  globalPageMenus: PageMenuRegistration[] = [];
  clusterPageMenus: ClusterPageMenuRegistration[] = [];
  kubeObjectStatusTexts: KubeObjectStatusRegistration[] = [];
  appPreferences: AppPreferenceRegistration[] = [];
  statusBarItems: StatusBarRegistration[] = [];
  kubeObjectDetailItems: KubeObjectDetailRegistration[] = [];
  commands: CommandRegistration[] = [];

  @observable kubeObjectMenuItems: Registrable<KubeObjectMenuRegistration> = [];
  get [registeredKubeObjectMenuItems]() {
    return this.#privateGetters[registeredKubeObjectMenuItems].get();
  }

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
  async isEnabledForCluster(cluster: Cluster): Promise<Boolean> {
    return (void cluster) || true;
  }
}
