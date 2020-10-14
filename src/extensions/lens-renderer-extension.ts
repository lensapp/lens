import { LensExtension } from "./lens-extension"
import type { PageRegistry } from "./extension-renderer-api"
import { AppPreferenceRegistry } from "./app-preference-registry";

export class LensRendererExtension extends LensExtension {

  registerPages(pageStore: PageRegistry) {
    return
  }

  registerAppPreferences(appPreferenceStore: AppPreferenceRegistry) {
    return
  }
}
