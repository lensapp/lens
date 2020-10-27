import { LensRendererExtension } from "@k8slens/extensions";
import { ExampleIcon, ExamplePage } from "./page"
import React from "react"

export default class ExampleExtension extends LensRendererExtension {
  onActivate() {
    console.log('EXAMPLE EXTENSION RENDERER: ACTIVATED', this.getMeta());
  }

  registerClusterPage() {
    return [
      {
        path: "/extension-example",
        title: "Example Extension",
        components: {
          Page: () => <ExamplePage extension={this} />,
          MenuIcon: ExampleIcon,
        }
      }
    ]
  }

  onDeactivate() {
    console.log('EXAMPLE EXTENSION RENDERER: DEACTIVATED', this.getMeta());
  }
}
