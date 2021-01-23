import "./workspace-cluster-icon.scss";

import React, { Component, Fragment } from "react";
import { Workspace } from "../../../common/workspace-store";
import { clusterStore } from "../../../common/cluster-store";
import { Cluster } from "../../../main/cluster";
import { observable, autorun } from "mobx";
import { observer } from "mobx-react";
import { WizardLayout } from "../layout/wizard-layout";
import { TabLayout } from "../layout/tab-layout";
import { ItemListLayout, ItemListLayoutProps } from "../item-object-list/item-list-layout";
import { autobind, stopPropagation } from "../../utils";
import { MarkdownViewer } from "../markdown-viewer";
import { Spinner } from "../spinner";
import { Button } from "../button";
import { Select, SelectOption } from "../select";
import { Badge } from "../badge";
import { Hashicon } from "@emeraldpay/hashicon-react";
import { ClusterItem, WorkspaceClusterStore } from "./workspace-cluster.store";

interface Props {
  workspace: Workspace;
}

enum sortBy {
    name = "name",
}

@observer
export class WorkspaceOverview extends Component<Props> {

  renderInfo() {
    const { workspace } = this.props;

    if (workspace.name === "default") {
      return (
        <Fragment>
          <h2>Default Workspace</h2>
          <p className="info">
            This is the default workspace. Workspaces are used to organize clusters into logical groups.
          </p>
          <p>
            A single workspaces contains a list of clusters and their full configuration.
          </p>
        </Fragment>
      );
    }

    return (
      <Fragment>
      <h2>Description</h2>
      <p className="info">
        {workspace.description}
      </p>
      </Fragment>
    )
  }

  getIcon(clusterItem: ClusterItem) {
    const { cluster } = clusterItem;
    const { name } = cluster;
    const { preferences, id: clusterId } = cluster;
    const { icon } = preferences;

    return (
      <div className="WorkspaceClusterIcon" >
        {icon && <img src={icon} alt={name}/>}
        {!icon && <Hashicon value={clusterId} />}
      </div>
    )
  }

  render() {
    const { workspace } = this.props;
    const workspaceClusterStore = new WorkspaceClusterStore(workspace.id);

    return (
      <WizardLayout className="Workspaces" infoPanel={this.renderInfo()}>
        <ItemListLayout 
          renderHeaderTitle={<div>Clusters</div>}
          isClusterScoped
          className="WorkspaceList" store={workspaceClusterStore}
          sortingCallbacks={{
              [sortBy.name]: (cluster: ClusterItem) => cluster.getName(),
          }}
          searchFilters={[]}
          renderTableHeader={[
              { title: "", className: "icon" },
              { title: "Name", className: "name flex-grow", sortBy: sortBy.name },
              { title: "Id", className: "id" },
          ]}
          renderTableContents={(item: ClusterItem) => [
              this.getIcon(item),
              item.getName(),
              item.getId(),
          ]}
        />
      </WizardLayout>
    );
  }
}
