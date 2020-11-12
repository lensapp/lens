import type { AppPreferenceRegistration, ClusterFeatureRegistration, KubeObjectDetailRegistration, KubeObjectMenuRegistration, KubeObjectStatusRegistration, PageMenuRegistration, PageRegistration, StatusBarRegistration, } from "./registries"
import { ipcRenderer } from "electron"
import { observable } from "mobx";
import { LensExtension } from "./lens-extension"

export class LensRendererExtension extends LensExtension {
  @observable.shallow globalPages: PageRegistration[] = []
  @observable.shallow clusterPages: PageRegistration[] = []
  @observable.shallow globalPageMenus: PageMenuRegistration[] = []
  @observable.shallow clusterPageMenus: PageMenuRegistration[] = []
  @observable.shallow kubeObjectStatusTexts: KubeObjectStatusRegistration[] = []
  @observable.shallow appPreferences: AppPreferenceRegistration[] = []
  @observable.shallow clusterFeatures: ClusterFeatureRegistration[] = []
  @observable.shallow statusBarItems: StatusBarRegistration[] = []
  @observable.shallow kubeObjectDetailItems: KubeObjectDetailRegistration[] = []
  @observable.shallow kubeObjectMenuItems: KubeObjectMenuRegistration[] = []

  navigate(location: string) {
    ipcRenderer.emit("renderer:navigate", this.getPageUrl(location))
  }
}
