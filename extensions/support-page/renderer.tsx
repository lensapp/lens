import React from "react";
import { Component, LensRendererExtension, Navigation, Registry } from "@k8slens/extensions";
import { supportPageRoute, supportPageURL } from "./src/support.route";
import { Support } from "./src/support";

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

  registerStatusBarIcon(registry: Registry.StatusBarRegistry) {
    this.disposers.push(
      registry.add({
        icon: (
          <Component.Icon
            material="support"
            tooltip="Support"
            onClick={() => Navigation.navigate(supportPageURL())}
          />
        )
      })
    )
  }
}
