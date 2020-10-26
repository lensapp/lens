import { LensExtension } from "./lens-extension"
import type { MenuRegistration, MenuRegistry } from "./registries/menu-registry";

export class LensMainExtension extends LensExtension {
  registerAppMenus(registry: MenuRegistry): MenuRegistration[] {
    return []
  }

  registerPrometheusProviders(registry: any): any[] {
    return []
  }
}
