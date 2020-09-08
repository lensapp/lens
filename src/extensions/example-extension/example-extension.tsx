import { Button, DynamicPageType, Icon, LensExtension } from "@lens/extensions"; // fixme: map to generated types from "extension-api.ts"
import React from "react";
import path from "path";

let extension: ExampleExtension; // todo: provide instance from context

export default class ExampleExtension extends LensExtension {
  protected unRegisterPage = Function();

  onActivate() {
    extension = this
    console.log('EXAMPLE EXTENSION: ACTIVATE', this.getMeta())
    const { dynamicPages } = this.runtime;

    this.unRegisterPage = dynamicPages.register({
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
    extension = null;
    console.log('EXAMPLE EXTENSION: DEACTIVATE', this.getMeta());
    this.unRegisterPage();
  }
}

export function ExtensionIcon(props: {} /*IconProps |*/) {
  return <Icon {...props} material="camera" tooltip={path.basename(__filename)}/>
}

export class ExtensionPage extends React.Component {
  deactivate = () => {
    extension.runtime.navigate("/")
    extension.disable();
  }

  render() {
    const { MainLayout } = extension.runtime.components;
    return (
      <MainLayout className="ExampleExtension">
        <div className="flex column gaps align-flex-start">
          <p>Hello from extensions-api!</p>
          <p>File: <i>{__filename}</i></p>
          <Button accent label="Deactivate" onClick={this.deactivate}/>
        </div>
      </MainLayout>
    )
  }
}
