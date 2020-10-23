import { LensExtension } from "./lens-extension"
import type { PageRegistry, AppPreferenceRegistry, StatusBarRegistry, KubeObjectMenuRegistry } from "./registries"

export class LensRendererExtension extends LensExtension {
  registerPages(registry: PageRegistry) {
    return
  }

  registerAppPreferences(registry: AppPreferenceRegistry) {
    return
  }

  registerStatusBarIcon(registry: StatusBarRegistry) {
    return
  }

  registerKubeObjectMenus(registry: KubeObjectMenuRegistry) {
    return
  }
}
