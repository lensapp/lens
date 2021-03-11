import "./workspace-overview.scss";

import React, { Component } from "react";
import { Workspace } from "../../../common/workspace-store";
import { observer } from "mobx-react";
import { ItemListLayout } from "../item-object-list/item-list-layout";
import { ClusterItem, WorkspaceClusterStore } from "./workspace-cluster.store";
import { navigate } from "../../navigation";
import { clusterViewURL } from "../cluster-manager/cluster-view.route";
import { WorkspaceClusterMenu } from "./workspace-cluster-menu";
import { kebabCase } from "lodash";
import { addClusterURL } from "../+add-cluster";
interface Props {
  workspace: Workspace;
}

enum sortBy {
    name = "name",
    distribution = "distribution",
    version = "version",
    online = "online"
}

@observer
export class WorkspaceOverview extends Component<Props> {
  private workspaceClusterStore = new WorkspaceClusterStore(this.props.workspace.id);

  componentDidMount() {
    this.workspaceClusterStore.loadAll();
  }


  showCluster = ({ clusterId }: ClusterItem) => {
    navigate(clusterViewURL({ params: { clusterId } }));
  };

  render() {
    const { workspace } = this.props;

    return (
      <ItemListLayout
        renderHeaderTitle="Clusters"
        isClusterScoped
        isSearchable={false}
        isSelectable={false}
        className="WorkspaceOverview"
        store={this.workspaceClusterStore}
        sortingCallbacks={{
          [sortBy.name]: (item: ClusterItem) => item.name,
          [sortBy.distribution]: (item: ClusterItem) => item.distribution,
          [sortBy.version]: (item: ClusterItem) => item.version,
          [sortBy.online]: (item: ClusterItem) => item.connectionStatus,
        }}
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { title: "Distribution", className: "distribution", sortBy: sortBy.distribution },
          { title: "Version", className: "version", sortBy: sortBy.version },
          { title: "Status", className: "status", sortBy: sortBy.online },
        ]}
        renderTableContents={(item: ClusterItem) => [
          item.name,
          item.distribution,
          item.version,
          { title: item.connectionStatus, className: kebabCase(item.connectionStatus) }
        ]}
        onDetails={this.showCluster}
        addRemoveButtons={{
          addTooltip: "Add Cluster",
          onAdd: () => navigate(addClusterURL()),
        }}
        renderItemMenu={(clusterItem: ClusterItem) => (
          <WorkspaceClusterMenu clusterItem={clusterItem} workspace={workspace} workspaceClusterStore={this.workspaceClusterStore}/>
        )}
      />
    );
  }
}
