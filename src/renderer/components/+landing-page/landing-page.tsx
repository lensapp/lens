import "./landing-page.scss";
import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { clusterStore } from "../../../common/cluster-store";
import { Workspace, workspaceStore } from "../../../common/workspace-store";
import { WorkspaceOverview } from "./workspace-overview";
import { PageLayout } from "../layout/page-layout";

@observer
export class LandingPage extends React.Component {
  @observable showHint = true;

  get workspace(): Workspace {
    return workspaceStore.currentWorkspace;
  }
  
  render() {
    const clusters = clusterStore.getByWorkspaceId(this.workspace.id);
    const noClustersInScope = !clusters.length;
    const showStartupHint = this.showHint && noClustersInScope;

    const header = <h2>Workspace: {this.workspace.name}</h2>;

    return (
      <PageLayout className="LandingPage flex column gaps" header={header} provideBackButtonNavigation={false} contentGaps={false}>
        {showStartupHint && (
          <div className="startup-hint flex column gaps" onMouseEnter={() => this.showHint = false}>
            <p>This is the quick launch menu.</p>
            <p>
              Associate clusters and choose the ones you want to access via quick launch menu by clicking the + button.
            </p>
          </div>
        )}
        <WorkspaceOverview workspace={this.workspace}/>
      </PageLayout>
    );
  }
}
