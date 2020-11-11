import type {
  AppPreferenceRegistration, ClusterFeatureRegistration,
  KubeObjectMenuRegistration, KubeObjectDetailRegistration, StatusBarRegistration, KubeObjectStatusRegistration,
  PageRegistration, PageMenuRegistration,
} from "./registries"
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
}
