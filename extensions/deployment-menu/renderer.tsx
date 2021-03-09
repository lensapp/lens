import { LensRendererExtension } from "@k8slens/extensions";
import { DeploymentLogsMenu, DeploymentLogsMenuProps } from "./src/logs-menu";
import React from "react";

export default class DeploymentMenuRendererExtension extends LensRendererExtension {
  kubeObjectMenuItems = [
    {
      kind: "Deployment",
      apiVersions: ["apps/v1"],
      components: {
        MenuItem: (props: DeploymentLogsMenuProps) => <DeploymentLogsMenu {...props} />
      }
    }
  ];
}
