import "./workspace-cluster-icon.scss";

import React, { Component } from "react";
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

  getIcon(clusterItem: ClusterItem) {
    const { cluster } = clusterItem;
    const { name } = cluster;
    const { preferences, id: clusterId } = cluster;
    const { icon } = preferences;

    return (
      <div className="WorkspaceClusterIcon flex inline" >
        {icon && <img src={icon} alt={name}/>}
        {!icon && <Hashicon value={clusterId} />}
      </div>
    )
  }

  render() {
    const { workspace } = this.props;
    const workspaceClusterStore = new WorkspaceClusterStore(workspace.id);

    return (
      <ItemListLayout 
        isClusterScoped
        className="WorkspaceList" store={workspaceClusterStore}
        sortingCallbacks={{
            [sortBy.name]: (cluster: ClusterItem) => cluster.getName(),
        }}
        searchFilters={[]}
        renderTableHeader={[
            { title: "Icon" },
            { title: "Name", className: "name flex-grow", sortBy: sortBy.name },
            { title: "Id", className: "id" },
        ]}
        renderTableContents={(item: ClusterItem) => [
            this.getIcon(item),
            item.getName(),
            item.getId(),
        ]}
      />
    );
  }
}
