import "./extensions.scss"
import React from "react";
import { observer } from "mobx-react";
import { extensionStore } from "../../../extensions/extension-store";
import { WizardLayout } from "../layout/wizard-layout";
import { Icon } from "../icon";

@observer
export class Extensions extends React.Component {
  // todo: add input-select to customize extensions loading folder(s)
  renderInfoPanel() {
    return (
      <div className="info-panel flex gaps align-center">
        <Icon material="info"/>
        <p>Extensions available to install</p>
      </div>
    );
  }

  render() {
    const { installed: installedExtensions } = extensionStore;
    return (
      <WizardLayout className="Extensions" infoPanel={this.renderInfoPanel()}>
        <h2>Extensions</h2>
        <pre>
          {JSON.stringify(installedExtensions.toJSON(), null, 2)}
        </pre>
      </WizardLayout>
    );
  }
}
