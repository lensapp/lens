import type {
  AppPreferenceRegistration, ClusterFeatureRegistration,
  KubeObjectMenuRegistration, KubeObjectDetailRegistration, StatusBarRegistration,
  PageRegistration, PageMenuRegistration, PageRegistrationCluster, PageMenuRegistrationCluster,
} from "./registries"
import { observable } from "mobx";
import { LensExtension } from "./lens-extension"

export class LensRendererExtension extends LensExtension {
  @observable.shallow globalPages: PageRegistration[] = []
  @observable.shallow clusterPages: PageRegistrationCluster[] = []
  @observable.shallow globalPageMenus: PageMenuRegistration[] = []
  @observable.shallow clusterPageMenus: PageMenuRegistrationCluster[] = []
  @observable.shallow appPreferences: AppPreferenceRegistration[] = []
  @observable.shallow clusterFeatures: ClusterFeatureRegistration[] = []
  @observable.shallow statusBarItems: StatusBarRegistration[] = []
  @observable.shallow kubeObjectDetailItems: KubeObjectDetailRegistration[] = []
  @observable.shallow kubeObjectMenuItems: KubeObjectMenuRegistration[] = []
}
