import React from "react";
import { Component, Interface, LensRendererExtension, Navigation } from "@k8slens/extensions";
import { Support } from "./src/support";
import { pageRoute, pageUrl } from "./src/common-vars";

export default class SupportPageRendererExtension extends LensRendererExtension {
  globalPages: Interface.PageRegistration[] = [
    {
      routePath: pageRoute,
      components: {
        Page: Support,
      }
    }
  ]

  statusBarItems = [
    {
      item: (
        <div
          className="flex align-center gaps hover-highlight"
          onClick={() => Navigation.navigate(this.getPageUrl(pageUrl))}
        >
          <Component.Icon material="help" smallest/>
        </div>
      )
    }
  ]
}
