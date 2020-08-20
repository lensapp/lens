import "./landing-page.scss"
import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { clusterStore } from "../../../common/cluster-store";
import { workspaceStore } from "../../../common/workspace-store";

@observer
export class LandingPage extends React.Component {
  render() {
    const clusters = clusterStore.getByWorkspaceId(workspaceStore.currentWorkspaceId);
    const noClustersInScope = !clusters.length;
    return (
      <div className="LandingPage flex">
        {noClustersInScope && (
          <div className="no-clusters flex column gaps box center">
            <h1>
              <Trans>Welcome!</Trans>
            </h1>
            <p>
              <Trans>Get started by associating one or more clusters to Lens.</Trans>
            </p>
          </div>
        )}
      </div>
    )
  }
}
