import { DynamicPageType, Icon, LensExtension } from "@lens/extensions"; // fixme: map to generated types from "extension-api.d.ts"
import React from "react";
import path from "path";

export default class ExampleExtension extends LensExtension {
  protected unRegisterPage = Function();

  onActivate() {
    console.log('EXAMPLE EXTENSION: ACTIVATE', this.getMeta())
    this.unRegisterPage = this.runtime.dynamicPages.register({
      type: DynamicPageType.CLUSTER,
      path: "/extension-example",
      menuTitle: "Example Extension",
      components: {
        Page: ExtensionPage,
        MenuIcon: ExtensionIcon,
      }
    })
  }

  onDeactivate() {
    console.log('EXAMPLE EXTENSION: DEACTIVATE', this.getMeta());
    this.unRegisterPage();
  }
}

export function ExtensionIcon(props: {} /*IconProps |*/) {
  return <Icon {...props} material="camera" tooltip={path.basename(__filename)}/>
}

// todo: provide extension-instance and lens-runtime (context/props/extension-js-scope)
export class ExtensionPage extends React.Component {
  render() {
    return (
      <div className="ExampleExtension" style={{ padding: "20px" }}>
        <div className="content flex column gaps align-flex-start">
          <p>Hello from extensions-api!</p>
          <p>File: <i>{__filename}</i></p>
        </div>
      </div>
    )
  }
}
