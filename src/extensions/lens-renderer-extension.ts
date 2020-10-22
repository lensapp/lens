import { LensExtension } from "./lens-extension"
import type { PageRegistry } from "./registries/page-registry"
import type { AppPreferenceRegistry } from "./registries/app-preference-registry";

export class LensRendererExtension extends LensExtension {
  registerPages(registry: PageRegistry) {
    return
  }

  registerAppPreferences(registry: AppPreferenceRegistry) {
    return
  }
}
