import { Registry, LensRendererExtension } from "@k8slens/extensions";
import { PodShellMenu } from "./src/shell-menu"
import { PodLogsMenu } from "./src/logs-menu"
import React from "react"

export default class PodMenuRendererExtension extends LensRendererExtension {
  async onActivate() {
    console.log("pod-menu extension activated")
  }

  registerKubeObjectMenus(registry: Registry.KubeObjectMenuRegistry) {
    this.disposers.push(
      registry.add({
        kind: "Pod",
        apiVersions: ["v1"],
        components: {
          MenuItem: (props) => <PodShellMenu {...props} />
        }
      })
    )
    this.disposers.push(
      registry.add({
        kind: "Pod",
        apiVersions: ["v1"],
        components: {
          MenuItem: (props) => <PodLogsMenu {...props} />
        }
      })
    )
  }
}
