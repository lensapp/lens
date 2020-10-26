import { LensExtension } from "./lens-extension"
import type { GlobalPageRegistry, ClusterPageRegistry, AppPreferenceRegistry, StatusBarRegistry, KubeObjectMenuRegistry, ClusterFeatureRegistry, PageRegistration, AppPreferenceRegistration, ClusterFeatureRegistration, StatusBarRegistration, KubeObjectMenuRegistration } from "./registries"

export class LensRendererExtension extends LensExtension {
  registerGlobalPages(registry: GlobalPageRegistry): PageRegistration[] {
    return []
  }

  registerClusterPages(registry: ClusterPageRegistry): PageRegistration[] {
    return []
  }

  registerAppPreferences(registry: AppPreferenceRegistry): AppPreferenceRegistration[] {
    return []
  }

  registerClusterFeatures(registry: ClusterFeatureRegistry): ClusterFeatureRegistration[] {
    return []
  }

  registerStatusBarItems(registry: StatusBarRegistry): StatusBarRegistration[] {
    return []
  }

  registerKubeObjectMenus(registry: KubeObjectMenuRegistry): KubeObjectMenuRegistration[] {
    return []
  }
}
