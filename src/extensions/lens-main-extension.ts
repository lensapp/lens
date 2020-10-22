import { LensExtension } from "./lens-extension"
import type { MenuRegistry } from "./registries/menu-registry";
import type { StatusBarRegistry } from "./registries/status-bar-registry";

export class LensMainExtension extends LensExtension {
  registerAppMenus(registry: MenuRegistry) {
    //
  }

  registerStatusBarIcon(registry: StatusBarRegistry) {
    //
  }

  registerPrometheusProviders(registry: any) {
    //
  }
}
