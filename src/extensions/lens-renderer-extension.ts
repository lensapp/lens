import { LensExtension } from "./lens-extension"
import type { PageRegistry } from "./page-registry"
import type { AppPreferenceRegistry } from "./app-preference-registry";

export class LensRendererExtension extends LensExtension {

  registerPages(registry: PageRegistry) {
    return
  }

  registerAppPreferences(registry: AppPreferenceRegistry) {
    return
  }
}
