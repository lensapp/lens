import { LensRendererExtension } from "@k8slens/extensions";
import { ExamplePage, ExampleIcon } from "./page"
import React from "react"

export default class ExampleExtension extends LensRendererExtension {
  onActivate() {
    console.log('EXAMPLE EXTENSION RENDERER: ACTIVATED', this.getMeta());
  }

  clusterPages() {
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
