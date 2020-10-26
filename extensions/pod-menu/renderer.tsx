import { Registry, LensRendererExtension } from "@k8slens/extensions";
import { PodShellMenu, PodShellMenuProps } from "./src/shell-menu"
import { PodLogsMenu, PodLogsMenuProps } from "./src/logs-menu"
import React from "react"

export default class PodMenuRendererExtension extends LensRendererExtension {
  async onActivate() {
    console.log("pod-menu extension activated")
  }

  registerKubeObjectMenus(registry: Registry.KubeObjectMenuRegistry) {
    return [
      {
        kind: "Pod",
        apiVersions: ["v1"],
        components: {
          MenuItem: (props: PodShellMenuProps) => <PodShellMenu {...props} />
        }
      },
      {
        kind: "Pod",
        apiVersions: ["v1"],
        components: {
          MenuItem: (props: PodLogsMenuProps) => <PodLogsMenu {...props} />
        }
      }
    ]
  }
}
