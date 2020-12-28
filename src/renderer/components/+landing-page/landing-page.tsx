import "./landing-page.scss";
import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { clusterStore } from "../../../common/cluster-store";
import { workspaceStore } from "../../../common/workspace-store";

@observer
export class LandingPage extends React.Component {
  @observable showHint = true;

  render() {
    const clusters = clusterStore.getByWorkspaceId(workspaceStore.currentWorkspaceId);
    const noClustersInScope = !clusters.length;
    const showStartupHint = this.showHint && noClustersInScope;

    return (
      <div className="LandingPage flex">
        {showStartupHint && (
          <div className="startup-hint flex column gaps" onMouseEnter={() => this.showHint = false}>
            <p>This is the quick launch menu.</p>
            <p>
              Associate clusters and choose the ones you want to access via quick launch menu by clicking the + button.
            </p>
          </div>
        )}
        {noClustersInScope && (
          <div className="no-clusters flex column gaps box center">
            <h1>
              Welcome!
            </h1>
            <p>
              Get started by associating one or more clusters to Lens.
            </p>
          </div>
        )}
      </div>
    );
  }
}
