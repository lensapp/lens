import { LensRendererExtension } from "@k8slens/extensions";
import { PodShellMenu } from "./src/shell-menu"
import { PodLogsMenu } from "./src/logs-menu"
import React from "react"

export default class PodMenuRendererExtension extends LensRendererExtension {
  async onActivate() {
    console.log("pod-menu extension activated")
  }

  kubeObjectMenus() {
    return [
      {
        kind: "Pod",
        apiVersions: ["v1"],
        components: {
          MenuItem: (props) => <PodShellMenu {...props} />
        }
      },
      {
        kind: "Pod",
        apiVersions: ["v1"],
        components: {
          MenuItem: (props) => <PodLogsMenu {...props} />
        }
      }
    ]
  }
}
