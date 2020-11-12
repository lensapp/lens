import React from "react";
import { Component, Interface, LensRendererExtension } from "@k8slens/extensions";
import { SupportPage } from "./src/support";

export default class SupportPageRendererExtension extends LensRendererExtension {
  globalPages: Interface.PageRegistration[] = [
    {
      components: {
        Page: SupportPage,
      }
    }
  ]

  statusBarItems: Interface.StatusBarRegistration[] = [
    {
      item: (
        <div className="SupportPageIcon flex align-center" onClick={() => this.navigate()}>
          <Component.Icon interactive material="help" smallest/>
        </div>
      )
    }
  ]
}
