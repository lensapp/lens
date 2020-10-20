import { LensExtension } from "./lens-extension"
import type { MenuRegistry } from "./menu-registry";
import type { StatusBarRegistry } from "./status-bar-registry";

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
