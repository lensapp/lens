import "./workspace-overview.scss";

import React, { Component } from "react";
import { Workspace } from "../../../common/workspace-store";
import { observer } from "mobx-react";
import { ItemListLayout } from "../item-object-list/item-list-layout";
import { ClusterItem, WorkspaceClusterStore } from "./workspace-cluster.store";
import { navigate } from "../../navigation";
import { clusterViewURL } from "../cluster-manager/cluster-view.route";
import { WorkspaceClusterMenu } from "./workspace-cluster-menu";

interface Props {
  workspace: Workspace;
}

enum sortBy {
    name = "name",
    contextName = "contextName",
    version = "version",
}

@observer
export class WorkspaceOverview extends Component<Props> {

  showCluster = (clusterItem: ClusterItem) => {
    const clusterId = clusterItem.getId();

    navigate(clusterViewURL({ params: { clusterId } }));
  };

  render() {
    const { workspace } = this.props;
    const workspaceClusterStore = new WorkspaceClusterStore(workspace.id);
    
    workspaceClusterStore.loadAll();

    return (
      <ItemListLayout 
        renderHeaderTitle={<div>Clusters</div>}
        isClusterScoped
        isSearchable={false}
        isSelectable={false}
        className="WorkspaceOverview"
        store={workspaceClusterStore}
        sortingCallbacks={{
          [sortBy.name]: (item: ClusterItem) => item.getName(),
          [sortBy.contextName]: (item: ClusterItem) => item.cluster.contextName,
          [sortBy.version]: (item: ClusterItem) => item.cluster.version,
        }}
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { title: "Context", className: "context", sortBy: sortBy.contextName },
          { title: "Version", className: "version", sortBy: sortBy.version },
          { title: "Status", className: "status" },
        ]}
        renderTableContents={(item: ClusterItem) => [
          item.getName(),
          item.cluster.contextName,
          item.cluster.version,
          item.cluster.online ? "online" : "offline"
        ]}
        onDetails={this.showCluster}
        renderItemMenu={(clusterItem: ClusterItem) => {
          return <WorkspaceClusterMenu clusterItem={clusterItem} workspace={workspace} workspaceClusterStore={workspaceClusterStore}/>;
        }}
      />
    );
  }
}
