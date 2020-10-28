import "./extensions.scss";

import React from "react";
import { Trans } from "@lingui/macro";
import { observer } from "mobx-react";
import { PageLayout } from "../layout/page-layout";
import { Badge } from "../badge";
import { Button } from "../button";

@observer
export class Extensions extends React.Component {
  disable() {
  }

  renderExtensions() {
    const extensions = [
      {
        id: "1",
        name: "hello-world",
        description: "Basic hello world example"
      },
      {
        id: "2",
        name: "light theme",
        description: "Classic light theme for lens"
      }
    ]
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
          <Button>Disable</Button>
        </Badge>
      )
    })
  }

  render() {
    const header = <h2><Trans>Extensions</Trans></h2>;
    return (
      <PageLayout showOnTop className="Extensions" header={header}>
        {this.renderExtensions()}
      </PageLayout>
    );
  }
}