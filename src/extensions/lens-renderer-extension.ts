import type {
  AppPreferenceRegistration, ClusterFeatureRegistration,
  KubeObjectMenuRegistration, KubeObjectDetailRegistration,
  PageRegistration, StatusBarRegistration
} from "./registries"
import { observable } from "mobx";
import { LensExtension } from "./lens-extension"

export class LensRendererExtension extends LensExtension {
  @observable.shallow globalPages: PageRegistration[] = []
  @observable.shallow clusterPages: PageRegistration[] = []
  @observable.shallow appPreferences: AppPreferenceRegistration[] = []
  @observable.shallow clusterFeatures: ClusterFeatureRegistration[] = []
  @observable.shallow statusBarItems: StatusBarRegistration[] = []
  @observable.shallow kubeObjectDetailItems: KubeObjectDetailRegistration[] = []
  @observable.shallow kubeObjectMenuItems: KubeObjectMenuRegistration[] = []
}
