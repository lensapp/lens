import { LensRendererExtension } from "@k8slens/extensions";
import { ExampleIcon, ExamplePage } from "./page";
import React from "react";

export default class ExampleExtension extends LensRendererExtension {
  clusterPages = [
    {
      id: "example",
      title: "Example Extension",
      components: {
        Page: () => <ExamplePage extension={this}/>,
      },
      params: {
        // setup param "exampleId" with default value "demo"
        // could be also {[paramName: string]: UrlParam} for advanced use-cases (custom parse/stringify)
        exampleId: "demo"
      }
    }
  ];

  clusterPageMenus = [
    {
      title: "Example extension",
      components: {
        Icon: ExampleIcon,
      },
      target: {
        pageId: "example",
        params: {
          exampleId: "demo-sample-2"
        },
      },
    },
    {
      title: "Example secret page",
      components: {
        Icon: ExampleIcon,
      },
      target: {
        pageId: "example",
        params: {
          exampleId: "secret"
        },
      },
    },
  ];
}
