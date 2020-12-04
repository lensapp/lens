import { LensRendererExtension } from "@k8slens/extensions";
import { ExampleIcon, ExamplePage, exampleIdPageParam } from "./page";
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
        exampleIdPageParam,
      ]
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
          // cause target page has registered a url-param with name "exampleId" == exampleNameUrlParam.name
          // passing values to page to generate final link
          exampleId: "demo-2"
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
