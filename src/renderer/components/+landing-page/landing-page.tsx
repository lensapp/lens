import "./landing-page.scss";
import React from "react";
import { observer } from "mobx-react";
import { Workspace, workspaceStore } from "../../../common/workspace-store";
import { WorkspaceOverview } from "./workspace-overview";
import { PageLayout } from "../layout/page-layout";
@observer
export class LandingPage extends React.Component {

  get workspace(): Workspace {
    return workspaceStore.currentWorkspace;
  }
  
  render() {
    const header = <h2>Workspace: {this.workspace.name}</h2>;

    return (
      <PageLayout className="LandingPage" header={header} provideBackButtonNavigation={false}>
        <WorkspaceOverview workspace={this.workspace}/>
      </PageLayout>
    );
  }
}
