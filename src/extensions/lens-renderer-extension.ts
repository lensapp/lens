import { LensExtension } from "./lens-extension"
import type { GlobalPageRegistry, ClusterPageRegistry, AppPreferenceRegistry, StatusBarRegistry, KubeObjectMenuRegistry, ClusterFeatureRegistry } from "./registries"

export class LensRendererExtension extends LensExtension {
  registerGlobalPage(registry: GlobalPageRegistry) {
    return
  }

  registerClusterPage(registry: ClusterPageRegistry) {
    return
  }

  registerAppPreferences(registry: AppPreferenceRegistry) {
    return
  }

  registerClusterFeatures(registry: ClusterFeatureRegistry) {
    return
  }

  registerStatusBarIcon(registry: StatusBarRegistry) {
    return
  }

  registerKubeObjectMenus(registry: KubeObjectMenuRegistry) {
    return
  }
}
