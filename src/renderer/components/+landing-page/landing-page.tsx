import "./landing-page.scss";
import React from "react";
import { observable, autorun } from "mobx";
import { observer } from "mobx-react";
import { clusterStore } from "../../../common/cluster-store";
import { Workspace, workspaceStore } from "../../../common/workspace-store";
import { PageLayout } from "../layout/page-layout"
import { Select, SelectOption } from "../select";
import { WorkspaceOverview } from "./workspace-overview"
import { autobind } from "../../../common/utils";

@observer
export class LandingPage extends React.Component {
  @observable showHint = true;
  @observable workspace: Workspace;

  currentWorkspace = autorun(() => { this.workspace = workspaceStore.currentWorkspace; })

  @autobind()
  getHeader() {
    const onWorkspaceChange = (option: SelectOption) => {
      const selectedWorkspace = workspaceStore.getByName(option.value);

      if (!selectedWorkspace) {
        return;
      }

      workspaceStore.setActive(selectedWorkspace.id);
    }

    const existingWorkspaces = workspaceStore.enabledWorkspacesList.map(w => ({value: w.name, label: w.name}));

    return (
      <h2 className="flex row center">
        <span>Workspace:</span>       
        <Select
          options={[{value: "New Workspace", label: "New Workspace..."}, ...existingWorkspaces]}
          value={this.workspace.name}
          onChange={onWorkspaceChange}
        />
      </h2>
    );
  }

  render() {
    const clusters = clusterStore.getByWorkspaceId(workspaceStore.currentWorkspaceId);
    const noClustersInScope = !clusters.length;
    const showStartupHint = this.showHint && noClustersInScope;

    const onWorkspaceChange = (option: SelectOption) => {
      const selectedWorkspace = workspaceStore.getByName(option.value);

      if (!selectedWorkspace) {
        return;
      }

      workspaceStore.setActive(selectedWorkspace.id);
    }

    const existingWorkspaces = workspaceStore.enabledWorkspacesList.map(w => ({value: w.name, label: w.name}));
    return (
      <PageLayout provideBackButtonNavigation={false} className="Workspaces" header={this.getHeader()} headerClass={"box center"}>
        <div className="LandingPage flex auto">
          {showStartupHint && (
            <div className="startup-hint flex column gaps" onMouseEnter={() => this.showHint = false}>
              <p>This is the quick launch menu.</p>
              <p>
                Click the + button to add clusters and choose the ones you want to access via quick launch menu.
              </p>
            </div>
          )}
          <div className="flex column">
            <div className="flex center">
              <span>Workspace:</span>       
              <Select
                options={[{value: "New Workspace", label: "New Workspace..."}, ...existingWorkspaces]}
                value={this.workspace.name}
                onChange={onWorkspaceChange}
                className="box grow"
              />
            </div>
            <WorkspaceOverview workspace={this.workspace}/>
          </div>
        </div>
      </PageLayout>
    );
  }
}
