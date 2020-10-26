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

  registerStatusBarItem(registry: Registry.StatusBarRegistry) {
    this.disposers.push(
      registry.add({
        item: (
          <div
            className="flex align-center gaps hover-highlight"
            onClick={() => Navigation.navigate(supportPageURL())}
          >
            <Component.Icon material="help_outline" small />
            <span>Support</span>
          </div>
        )
      })
    )
  }
}
