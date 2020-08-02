import React from "react";
import { Cluster } from "../../../../main/cluster";
import { clusterStore } from "../../../../common/cluster-store"
import { workspaceStore } from "../../../../common/workspace-store"
import { Select, SelectOption } from "../../../components/select";
import { GeneralInputStatus } from "./statuses"
import { observable } from "mobx";
import { autobind } from "../../../utils";
import { observer } from "mobx-react";

interface Props {
    cluster: Cluster;
}

@observer
export class ClusterWorkspaceSetting extends React.Component<Props> {
  @observable workspace = this.props.cluster.workspace;

  render() {
    return <>
      <h4>Cluster Workspace</h4>
      <p>Change cluster workspace:</p>
      <Select
        value={workspaceStore.currentWorkspaceId}
        options={workspaceStore.workspacesList.map(w => ({value: w.id, label: <span>{w.name}</span>}))}
        onChange={this.changeWorkspace}
      />
    </>;
  }

  @autobind()
  changeWorkspace({ value: workspace }: SelectOption<string>) {
    this.workspace = workspace;
    this.props.cluster.workspace = workspace;
  }
}