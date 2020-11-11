import React from "react";
import { Component, Interface, LensRendererExtension } from "@k8slens/extensions";
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
        <div className="flex align-center gaps hover-highlight" onClick={() => this.navigate(pageUrl)}>
          <Component.Icon material="help" smallest/>
        </div>
      )
    }
  ]
}
