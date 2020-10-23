import { LensExtension } from "./lens-extension"
import type { PageRegistry, AppPreferenceRegistry, StatusBarRegistry } from "./registries/page-registry"
import type { KubeObjectMenuRegistry } from "../renderer/api/kube-object-menu-registry";

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
