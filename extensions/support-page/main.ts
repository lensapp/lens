import { LensMainExtension, Registry, windowManager } from "@k8slens/extensions";
import { supportPageURL } from "./src/support.route";

export default class SupportPageMainExtension extends LensMainExtension {
  async onActivate() {
    console.log("support page extension activated")
  }

  async registerAppMenus(registry: Registry.MenuRegistry) {
    this.disposers.push(
      registry.add({
        parentId: "help",
        label: "Support",
        click() {
          windowManager.navigate({
            channel: "menu:navigate", // fixme: use windowManager.ensureMainWindow from Tray's PR
            url: supportPageURL(),
          });
        }
      })
    )
  }
}
