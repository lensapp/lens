import { LensRendererExtension } from "@k8slens/extensions";
import { PodShellMenu, PodShellMenuProps } from "./src/shell-menu"
import { PodLogsMenu, PodLogsMenuProps } from "./src/logs-menu"
import React from "react"

export default class PodMenuRendererExtension extends LensRendererExtension {
  kubeObjectMenuItems = [
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
