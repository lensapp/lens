import React from "react";
import { Renderer } from "@k8slens/extensions";
import { NodeTraceMenuItem, PodTraceMenuItem } from "./trace-menu";

type Pod = Renderer.K8sApi.Pod;
type Node = Renderer.K8sApi.Node;

export default class BpfTraceRendererExtension extends Renderer.LensExtension {
  kubeObjectMenuItems = [
    {
      kind: "Node",
      apiVersions: ["v1"],
      components: {
        MenuItem: (props: Renderer.Component.KubeObjectMenuProps<Node>) => (
          <NodeTraceMenuItem {...props} />
        ),
      },
    },
    {
      kind: "Pod",
      apiVersions: ["v1"],
      components: {
        MenuItem: (props: Renderer.Component.KubeObjectMenuProps<Pod>) => (
          <PodTraceMenuItem {...props} />
        ),
      },
    },
  ];
}
