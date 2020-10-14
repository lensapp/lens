import { Button, Icon, IconProps, LensRendererExtension } from "@lens/ui-extensions";
import { CoffeeDoodle } from "react-open-doodles";
import path from "path";
import React from "react"

export function ExtensionIcon(props: IconProps) {
  return <Icon {...props} material="pages" tooltip={path.basename(__filename)}/>
}

export class ExtensionPage extends React.Component<{ extension: LensRendererExtension }> {
  deactivate = () => {
    const { extension } = this.props;
    extension.disable();
  }

  render() {
    const doodleStyle = {
      width: "200px"
    }
    return (
      <div className="flex column gaps align-flex-start">
        <div style={doodleStyle}><CoffeeDoodle accent="#3d90ce" /></div>
        <p>Hello from Example extension!</p>
        <p>File: <i>{__filename}</i></p>
        <Button accent label="Deactivate" onClick={this.deactivate}/>
      </div>
    )
  }
}

export function examplePage(ext: LensRendererExtension) {
  return () => <ExtensionPage extension={ext} />
}
