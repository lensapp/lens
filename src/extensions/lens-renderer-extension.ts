import { LensExtension } from "./lens-extension"
import type { AppPreferenceRegistration, ClusterFeatureRegistration, KubeObjectMenuRegistration, PageRegistration, StatusBarRegistration } from "./registries"

export class LensRendererExtension extends LensExtension {
  registerGlobalPages(): PageRegistration[] {
    return []
  }

  registerClusterPages(): PageRegistration[] {
    return []
  }

  registerAppPreferences(): AppPreferenceRegistration[] {
    return []
  }

  registerClusterFeatures(): ClusterFeatureRegistration[] {
    return []
  }

  registerStatusBarItems(): StatusBarRegistration[] {
    return []
  }

  registerKubeObjectMenus(): KubeObjectMenuRegistration[] {
    return []
  }
}
