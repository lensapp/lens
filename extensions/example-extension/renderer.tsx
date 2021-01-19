import { Component, Interface, K8sApi, LensRendererExtension } from "@k8slens/extensions";
import { ExamplePage, ExamplePageParams, namespaceStore } from "./page";
import React from "react";
import path from "path";

export default class ExampleExtension extends LensRendererExtension {
  clusterPages: Interface.PageRegistration[] = [
    {
      components: {
        Page: (props: Interface.PageComponentProps<ExamplePageParams>) => {
          return <ExamplePage {...props} extension={this}/>;
        },
      },
      params: {
        // setup basic param "exampleId" with default value "demo"
        exampleId: "demo",

        // setup advanced multi-values param "selectedNamespaces" with custom parsing/stringification
        selectedNamespaces: {
          defaultValueStringified: ["default", "kube-system"],
          multiValues: true,
          parse(values: string[]) { // from URL
            return values.map(name => namespaceStore.getByName(name)).filter(Boolean);
          },
          stringify(values: K8sApi.Namespace[]) { // to URL
            return values.map(namespace => namespace.getName());
          },
        }
      }
    }
  ];

  clusterPageMenus: Interface.ClusterPageMenuRegistration[] = [
    {
      title: "Example extension",
      components: {
        Icon: ExampleIcon,
      },
    },
  ];
}

export function ExampleIcon(props: Component.IconProps) {
  return <Component.Icon {...props} material="pages" tooltip={path.basename(__filename)}/>;
}
