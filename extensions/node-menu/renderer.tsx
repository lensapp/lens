import { Registry, LensRendererExtension } from "@k8slens/extensions";
import React from "react"
import { NodeMenu, NodeMenuProps } from "./src/node-menu"

export default class NodeMenuRendererExtension extends LensRendererExtension {
  async onActivate() {
    console.log("node-menu extension activated")
  }

  registerKubeObjectMenus(registry: Registry.KubeObjectMenuRegistry) {
    return [
      {
        kind: "Node",
        apiVersions: ["v1"],
        components: {
          MenuItem: (props: NodeMenuProps) => <NodeMenu {...props} />
        }
      }
    ]
  }
}
