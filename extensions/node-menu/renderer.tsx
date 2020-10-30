import { LensRendererExtension } from "@k8slens/extensions";
import React from "react"
import { NodeMenu, NodeMenuProps } from "./src/node-menu"

export default class NodeMenuRendererExtension extends LensRendererExtension {
  kubeObjectMenuItems = [
    {
      kind: "Node",
      apiVersions: ["v1"],
      components: {
        MenuItem: (props: NodeMenuProps) => <NodeMenu {...props} />
      }
    }
  ]
}
