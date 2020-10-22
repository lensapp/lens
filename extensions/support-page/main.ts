import { LensMainExtension, Registry } from "@k8slens/extensions";
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
        async click() {
          // fixme: require runtime windowManager (ensureMainWindow + navigate for main)
          console.log(`navigate: ${supportPageURL()}`);
        }
      })
    )
  }
}
