import { LensRendererExtension } from "@k8slens/extensions";
import { ExampleIcon, ExamplePage, exampleNameUrlParam } from "./page";
import React from "react";

export default class ExampleExtension extends LensRendererExtension {
  clusterPages = [
    {
      id: "example",
      title: "Example Extension",
      components: {
        Page: () => <ExamplePage extension={this}/>,
      },
      params: [
        exampleNameUrlParam,
      ]
    }
  ];

  clusterPageMenus = [
    {
      target: { pageId: "example" },
      title: "Example Extension",
      components: {
        Icon: ExampleIcon,
      }
    }
  ];
}
