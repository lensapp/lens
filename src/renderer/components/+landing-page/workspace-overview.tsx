import "./workspace-overview.scss";

import React, { Component } from "react";
import { observer } from "mobx-react";
import { ItemListLayout } from "../item-object-list/item-list-layout";
import { ClusterItem, WorkspaceClusterStore } from "./workspace-cluster.store";
import { navigate } from "../../navigation";
import { clusterViewURL } from "../cluster-manager/cluster-view.route";
import { WorkspaceClusterMenu } from "./workspace-cluster-menu";
import { kebabCase } from "lodash";
import { addClusterURL } from "../+add-cluster";
import { IReactionDisposer, observable, reaction } from "mobx";
import { workspaceStore } from "../../../common/workspace-store";

enum sortBy {
    name = "name",
    distribution = "distribution",
    version = "version",
    online = "online"
}

@observer
export class WorkspaceOverview extends Component {
  @observable private workspaceClusterStore?: WorkspaceClusterStore;

  disposeWorkspaceWatch: IReactionDisposer;
  disposeClustersWatch: IReactionDisposer;

  componentDidMount() {
    this.disposeWorkspaceWatch = reaction(() => workspaceStore.currentWorkspaceId, workspaceId => {
      this.workspaceClusterStore = new WorkspaceClusterStore(workspaceId);
      this.disposeClustersWatch?.();
      this.disposeClustersWatch = this.workspaceClusterStore.watch();
    }, {
      fireImmediately: true,
    });
  }

  componentWillUnmount() {
    this.disposeWorkspaceWatch?.();
    this.disposeClustersWatch?.();
  }

  showCluster = ({ clusterId }: ClusterItem) => {
    navigate(clusterViewURL({ params: { clusterId } }));
  };

  render() {
    const { workspaceClusterStore } = this;

    if (!workspaceClusterStore) {
      return null;
    }

    return (
      <ItemListLayout
        renderHeaderTitle="Clusters"
        isClusterScoped
        isSearchable={false}
        isSelectable={false}
        className="WorkspaceOverview"
        store={workspaceClusterStore}
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
          <WorkspaceClusterMenu clusterItem={clusterItem} workspace={workspaceStore.currentWorkspace} workspaceClusterStore={workspaceClusterStore}/>
        )}
      />
    );
  }
}
