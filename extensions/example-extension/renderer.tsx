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
      }
    }
  ];

  clusterPageMenus = [
    {
      target: { pageId: "example", params: {} },
      title: "Example Extension",
      components: {
        Icon: ExampleIcon,
      }
    }
  ];
}
