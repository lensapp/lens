import "./extensions.scss";

import React, { Fragment } from "react";
import { Trans } from "@lingui/macro";
import { observer } from "mobx-react";
import { Badge } from "../badge";
import { Button } from "../button";
import { extensionLoader } from "../../../extensions/extension-loader";
import { WizardLayout } from "../layout/wizard-layout";

@observer
export class Extensions extends React.Component {
  disable(name: string) {
  }

  renderInfo() {
    return (
      <Fragment>
        <h2>Lens Extension API</h2>
        <p>
          The Extensions API in Lens allows users to customize and enhance the Lens experience by creating their own menus or page content that is extended from the existing pages. Many of the core features of Lens are built as extensions and use the same Extension API.
        </p>
        <p>
          <a href="https://docs.k8slens.dev/extensions/overview/" target="_blank">Check out documentation to learn more</a>.
        </p>
      </Fragment>
    )
  }

  renderExtensions() {
    const extensions = extensionLoader.userExtensions;
    if (!extensions.length) {
      return (
        <div className="flex align-center box grow justify-center gaps">
          <span>There are no extensions found in</span>
          <Badge>/.k8slens/extensions</Badge>
        </div>
      )
    }
    return extensions.map(extension => {
      const { id, name, description } = extension;
      return (
        <Badge key={id} className="extension flex gaps align-center justify-space-between">
          <div>
            <div className="name">
              {name}
            </div>
            <div className="description">
              {description}
            </div>
          </div>
          <Button onClick={() => this.disable(name)}>Disable</Button>
        </Badge>
      )
    })
  }

  render() {
    return (
      <WizardLayout
        className="Extensions"
        infoPanel={this.renderInfo()}
      >
        <h2><Trans>Extensions</Trans></h2>
        <div className="extension-list">
          {this.renderExtensions()}
        </div>
      </WizardLayout>
    );
  }
}