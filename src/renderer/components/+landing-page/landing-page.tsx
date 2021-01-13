import "./landing-page.scss";
import React from "react";
import { observable, autorun } from "mobx";
import { observer } from "mobx-react";
import { clusterStore } from "../../../common/cluster-store";
import { Workspace, workspaceStore } from "../../../common/workspace-store";
import { PageLayout } from "../layout/page-layout"
import { WorkspaceOverview } from "./workspace-overview"
@observer
export class LandingPage extends React.Component {
  @observable showHint = true;
  @observable workspace: Workspace;

  currentWorkspace = autorun(() => { this.workspace = workspaceStore.currentWorkspace; })

  render() {
    const clusters = clusterStore.getByWorkspaceId(workspaceStore.currentWorkspaceId);
    const noClustersInScope = !clusters.length;
    const showStartupHint = this.showHint && noClustersInScope;

    const header = <h2>{`Workspace: ${this.workspace?.name}`}</h2>;

    return (
      <PageLayout provideBackButtonNavigation={false} className="Workspaces" header={header} headerClass={"box center"}>
        <div className="LandingPage flex auto">
          {showStartupHint && (
            <div className="startup-hint flex column gaps" onMouseEnter={() => this.showHint = false}>
              <p>This is the quick launch menu.</p>
              <p>
                Click the + button to add clusters and choose the ones you want to access via quick launch menu.
              </p>
            </div>
          )}
          {!noClustersInScope && (
            <WorkspaceOverview workspace={this.workspace}/>
          )}          
          {noClustersInScope && (
            <div className="no-clusters flex column gaps box center">
              <h1>
                Welcome!
              </h1>
              <p>
                Get started by adding one or more clusters to this workspace.
              </p>
            </div>
          )}
        </div>
      </PageLayout>
    );
  }
}
