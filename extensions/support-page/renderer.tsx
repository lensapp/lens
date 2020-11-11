import React from "react";
import { Component, LensRendererExtension, Navigation } from "@k8slens/extensions";
import { supportPageRoute, supportPageURL } from "./src/support.route";
import { Support } from "./src/support";

export default class SupportPageRendererExtension extends LensRendererExtension {
  globalPages = [
    {
      ...supportPageRoute,
      url: supportPageURL(),
      hideInMenu: true,
      components: {
        Page: Support,
      }
    }
  ]

  statusBarItems = [
    {
      item: (
        <div
          className="SupportPageIcon flex align-center"
          onClick={() => Navigation.navigate(supportPageURL())}
        >
          <Component.Icon interactive material="help" smallest />
        </div>
      )
    }
  ]
}
