import { Button, DynamicPageType, Icon, IconProps, LensExtension, React } from "@lens/extensions";
import path from "path";

export default class ExampleExtension extends LensExtension {
  onActivate() {
    console.log('EXAMPLE EXTENSION: ACTIVATED', this.getMeta());
    this.registerPage({
      type: DynamicPageType.CLUSTER,
      path: "/extension-example",
      menuTitle: "Example Extension",
      components: {
        Page: () => <ExtensionPage extension={this}/>,
        MenuIcon: ExtensionIcon,
      }
    })
  }

  onDeactivate() {
    console.log('EXAMPLE EXTENSION: DEACTIVATED', this.getMeta());
  }
}

export function ExtensionIcon(props: IconProps) {
  return <Icon {...props} material="camera" tooltip={path.basename(__filename)}/>
}

export class ExtensionPage extends React.Component<{ extension: ExampleExtension }> {
  deactivate = () => {
    const { extension } = this.props;
    extension.runtime.navigate("/")
    extension.disable();
  }

  render() {
    const { TabLayout } = this.props.extension.runtime.components;
    return (
      <TabLayout className="ExampleExtension">
        <div className="flex column gaps align-flex-start">
          <p>Hello from extensions-api!</p>
          <p>File: <i>{__filename}</i></p>
          <Button accent label="Deactivate" onClick={this.deactivate}/>
        </div>
      </TabLayout>
    )
  }
}
