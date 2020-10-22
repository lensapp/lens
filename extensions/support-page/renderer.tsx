import { LensRendererExtension, Registry } from "@k8slens/extensions";
import { Support } from "./src/support";
import { supportPageRoute, supportPageURL } from "./src/support.route";

export default class SupportPageRendererExtension extends LensRendererExtension {
  async onActivate() {
    console.log("support page extension activated")
  }

  registerPages(registry: Registry.PageRegistry) {
    this.disposers.push(
      registry.add({
        ...supportPageRoute,
        type: Registry.PageRegistryType.GLOBAL,
        url: supportPageURL(),
        components: {
          Page: Support,
        }
      })
    )
  }
}
