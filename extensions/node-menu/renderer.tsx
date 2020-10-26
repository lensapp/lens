import { LensRendererExtension } from "@k8slens/extensions";
import React from "react"
import { NodeMenu } from "./src/node-menu"

export default class NodeMenuRendererExtension extends LensRendererExtension {
  async onActivate() {
    console.log("node-menu extension activated")
  }

  kubeObjectMenus() {
    return [
      {
        kind: "Node",
        apiVersions: ["v1"],
        components: {
          MenuItem: (props) => <NodeMenu {...props} />
        }
      }
    ]
  }
}
