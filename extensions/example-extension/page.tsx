import { Component, LensRendererExtension, Navigation } from "@k8slens/extensions";
import { CoffeeDoodle } from "react-open-doodles";
import React from "react";
import path from "path";
import { observer } from "mobx-react";

export const exampleIdPageParam = Navigation.createUrlParam<string>({
  name: "exampleId",
  defaultValue: "demo",
});

export function ExampleIcon(props: Component.IconProps) {
  return <Component.Icon {...props} material="pages" tooltip={path.basename(__filename)}/>;
}

@observer
export class ExamplePage extends React.Component<{ extension: LensRendererExtension }> {
  deactivate = () => {
    const { extension } = this.props;

    extension.disable();
  };

  render() {
    const exampleName = exampleIdPageParam.get();
    const doodleStyle = {
      width: "200px"
    };

    return (
      <div className="flex column gaps align-flex-start" style={{ padding: 24 }}>
        <div style={doodleStyle}><CoffeeDoodle accent="#3d90ce"/></div>

        <p>Hello from Example extension!</p>
        <p>File: <i>{__filename}</i></p>
        <p>Location: <i>{location.href}</i></p>

        <p className="url-params-demo flex column gaps">
          <a onClick={() => exampleIdPageParam.set("secret")}>Show secret button</a>
          {exampleName === "secret" && (
            <Component.Button accent label="Deactivate" onClick={this.deactivate}/>
          )}
        </p>
      </div>
    );
  }
}
