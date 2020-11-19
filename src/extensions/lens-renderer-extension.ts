import type { AppPreferenceRegistration, ClusterFeatureRegistration, KubeObjectDetailRegistration, KubeObjectMenuRegistration, KubeObjectStatusRegistration, PageMenuRegistration, PageRegistration, StatusBarRegistration, } from "./registries";
import { observable } from "mobx";
import { LensExtension } from "./lens-extension";
import { getExtensionPageUrl } from "./registries/page-registry";

export class LensRendererExtension extends LensExtension {
  @observable.shallow globalPages: PageRegistration[] = [];
  @observable.shallow clusterPages: PageRegistration[] = [];
  @observable.shallow globalPageMenus: PageMenuRegistration[] = [];
  @observable.shallow clusterPageMenus: PageMenuRegistration[] = [];
  @observable.shallow kubeObjectStatusTexts: KubeObjectStatusRegistration[] = [];
  @observable.shallow appPreferences: AppPreferenceRegistration[] = [];
  @observable.shallow clusterFeatures: ClusterFeatureRegistration[] = [];
  @observable.shallow statusBarItems: StatusBarRegistration[] = [];
  @observable.shallow kubeObjectDetailItems: KubeObjectDetailRegistration[] = [];
  @observable.shallow kubeObjectMenuItems: KubeObjectMenuRegistration[] = [];

  async navigate<P extends object>(pageId?: string, params?: P) {
    const { navigate } = await import("../renderer/navigation");
    const pageUrl = getExtensionPageUrl({
      extensionId: this.name,
      pageId: pageId,
      params: params ?? {}, // compile to url with params
    });
    navigate(pageUrl);
  }
}
