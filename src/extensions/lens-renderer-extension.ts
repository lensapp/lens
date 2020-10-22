import { LensExtension } from "./lens-extension"
import type { PageRegistry } from "./registries/page-registry"
import type { AppPreferenceRegistry } from "./registries/app-preference-registry";
import type { StatusBarRegistry } from "./registries";

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
}
