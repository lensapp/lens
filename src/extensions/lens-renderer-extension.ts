import { LensExtension } from "./lens-extension"
import type { PageRegistry } from "./page-registry"
import type { AppPreferenceRegistry } from "./app-preference-registry";
import type { KubeObjectMenuRegistry } from "../renderer/api/kube-object-menu-registry";

export class LensRendererExtension extends LensExtension {

  registerPages(registry: PageRegistry) {
    return
  }

  registerAppPreferences(registry: AppPreferenceRegistry) {
    return
  }

  registerKubeObjectMenus(registry: KubeObjectMenuRegistry) {
    return
  }
}
