import React from "react";
import { Component, Interface, LensRendererExtension } from "@k8slens/extensions";
import { SupportPage } from "./src/support";

export default class SupportPageRendererExtension extends LensRendererExtension {
  globalPages: Interface.PageRegistration[] = [
    {
      id: "support",
      routePath: "/support",
      components: {
        Page: SupportPage,
      }
    }
  ]

  statusBarItems: Interface.StatusBarRegistration[] = [
    {
      item: (
        <div className="SupportPageIcon flex align-center" onClick={() => this.navigate("/support")}>
          <Component.Icon interactive material="help" smallest/>
        </div>
      )
    }
  ]
}
