import { LensExtension } from "./lens-extension"
import type { MenuRegistration } from "./registries/menu-registry";

export class LensMainExtension extends LensExtension {
  registerAppMenus(): MenuRegistration[] {
    return []
  }

  registerPrometheusProviders(): any[] {
    return []
  }
}
