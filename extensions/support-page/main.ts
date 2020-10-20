import { LensMainExtension } from "@lens/extensions";

export default class SupportPageMainExtension extends LensMainExtension {
  async onActivate() {
    console.log("support page extension activated")
  }

  async registerAppMenus() {
    // TODO: allow to modify global menu item "Help -> Support"
  }
}
