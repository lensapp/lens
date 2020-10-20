import { LensMainExtension, Registry } from "@lens/extensions";

export default class SupportPageMainExtension extends LensMainExtension {
  async onActivate() {
    console.log("support page extension activated")
  }

  async registerAppMenus(registry: Registry.MenuRegistry) {
    // TODO: allow to modify global menu item "Help -> Support"
  }
}
