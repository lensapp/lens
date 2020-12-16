import { Component, Interface, K8sApi, LensRendererExtension } from "@k8slens/extensions";
import { 
  ExamplePage, ExamplePageParams, namespaceStore,
  SimplePage, SimpleParamsPage, SimpleParamsPageParams
} from "./page";
import React from "react";
import path from "path";

export default class ExampleExtension extends LensRendererExtension {
  clusterPages: Interface.PageRegistration[] = [
    {
      id: "simple-page",
      components: {
        Page: () => {
          return <SimplePage extension={this}/>;
        },
      },
    },
    {
      id: "page-with-simple-params",
      components: {
        Page: (props: Interface.PageComponentProps<SimpleParamsPageParams>) => {
          return <SimpleParamsPage {...props} extension={this}/>;
        },
      },
      params: {
        // setup basic param "exampleId" with default value "demo"
        exampleId: "demo",
        namespace: "default"
      }
    },
    {
      id: "page-with-complicated-params",
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
      id: "top-example-menu",
      title: "Example extension",
      components: {
        Icon: ExampleIcon,
      },
    },
    {
      parentId: "top-example-menu",
      title: "Simple Page",
      target: {
        pageId: "simple-page"
      },
      components: {
        Icon: ExampleIcon,
      },
    },
    {
      parentId: "top-example-menu",
      title: "Simple Params",
      target: {
        pageId: "page-with-simple-parms",
        params: {
          exampleId: "no-secret",
          namespace: "test"
        }
      },
      components: {
        Icon: ExampleIcon,
      },
    },
    {
      parentId: "top-example-menu",
      title: "Complicated Params",
      target: {
        pageId: "page-with-complicated-params"
      },
      components: {
        Icon: ExampleIcon,
      },
    },
  ];
}

export function ExampleIcon(props: Component.IconProps) {
  return <Component.Icon {...props} material="pages" tooltip={path.basename(__filename)}/>;
}
