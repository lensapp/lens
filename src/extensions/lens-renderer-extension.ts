import { LensExtension } from "./lens-extension"
import type { GlobalPageRegistry, ClusterPageRegistry, AppPreferenceRegistry, StatusBarRegistry, KubeObjectMenuRegistry, ClusterFeatureRegistry,
  PageRegistration, AppPreferenceRegistration, StatusBarRegistration, KubeObjectMenuRegistration, ClusterFeatureRegistration } from "./registries"

export class LensRendererExtension extends LensExtension {
  /*
   * Extensions must implement these
   */

  globalPages(): PageRegistration[] {
    return []
  }

  clusterPages(): PageRegistration[] {
    return []
  }

  appPreferences(): AppPreferenceRegistration[] {
    return []
  }

  clusterFeatures(): ClusterFeatureRegistration[] {
    return []
  }

  statusBarItems(): StatusBarRegistration[] {
    return []
  }

  kubeObjectMenus(): KubeObjectMenuRegistration[] {
    return []
  }

  /*
   * these don't need to be exposed to extension developers (can we hide them?)
   */
  registerGlobalPage(registry: GlobalPageRegistry) {
    for (let page of this.globalPages()) {
      this.disposers.push(registry.add(page))
    }
  }

  registerClusterPage(registry: ClusterPageRegistry) {
    for (let page of this.clusterPages()) {
      this.disposers.push(registry.add(page))
    }
  }

  registerAppPreferences(registry: AppPreferenceRegistry) {
    for (let preference of this.appPreferences()) {
      this.disposers.push(registry.add(preference))
    }
  }

  registerClusterFeatures(registry: ClusterFeatureRegistry) {
    for (let feature of this.clusterFeatures()) {
      this.disposers.push(registry.add(feature))
    }
  }

  registerStatusBarItem(registry: StatusBarRegistry) {
    for (let item of this.statusBarItems()) {
      this.disposers.push(registry.add(item))
    }
  }

  registerKubeObjectMenus(registry: KubeObjectMenuRegistry) {
    for (let menu of this.kubeObjectMenus()) {
      this.disposers.push(registry.add(menu))
    }
  }
}
