/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer } from "@k8slens/extensions";
import React from "react";
import { NodeMenu, NodeMenuProps } from "./src/node-menu";

export default class NodeMenuRendererExtension extends Renderer.LensExtension {
  kubeObjectMenuItems = [
    {
      kind: "Node",
      apiVersions: ["v1"],
      components: {
        MenuItem: (props: NodeMenuProps) => <NodeMenu {...props} />,
      },
    },
  ];
}
