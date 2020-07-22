import "./workspaces.scss"
import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { WizardLayout } from "../layout/wizard-layout";
import { workspaceStore } from "../../../common/workspace-store";

@observer
export class Workspaces extends React.Component {
  renderInfo() {
    return (
      <Fragment>
        <h2><Trans>What is a Workspace?</Trans></h2>
        <p><Trans>Workspaces are used to organize number of clusters into logical groups.</Trans></p>
        <p><Trans>A single workspaces contains a list of clusters and their full configuration.</Trans></p>
      </Fragment>
    )
  }

  addWorkspace = () => {
    console.log('add workspace')
  }

  render() {
    const { workspacesList, currentWorkspace } = workspaceStore;
    return (
      <WizardLayout className="Workspaces" infoPanel={this.renderInfo()}>
        <h2>
          <Trans>Workspaces</Trans>
        </h2>
        <div className="workspaces">
          {workspacesList.map(({ id: workspaceId, name, description }) => {
            return (
              <div key={workspaceId} className="workspace flex gaps">
                <span className="name">{name}</span>
                <span className="description">{description}</span>
              </div>
            )
          })}
        </div>
      </WizardLayout>
    );
  }
}
