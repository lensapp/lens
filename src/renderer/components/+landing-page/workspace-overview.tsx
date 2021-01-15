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
import { ClusterItem, WorkspaceClusterStore } from "./workspace-cluster.store";

interface Props {
  workspace: Workspace;
}

enum sortBy {
    name = "name",
}

@observer
export class WorkspaceOverview extends Component<Props> {

  render() {
    const { workspace } = this.props;
    const workspaceClusterStore = new WorkspaceClusterStore(workspace.id);

    return (
        <TabLayout>
          <ItemListLayout 
            isClusterScoped
            className="WorkspaceList" store={workspaceClusterStore}
            sortingCallbacks={{
              [sortBy.name]: (cluster: ClusterItem) => cluster.getName(),
            }}
            searchFilters={[]}
            renderTableHeader={[
              { title: "Name", className: "name flex-grow", sortBy: sortBy.name },
              { title: "Id", className: "id" },
            ]}
            renderTableContents={(item: ClusterItem) => [
              item.getName(),
              item.getId(),
            ]}
          />
        </TabLayout>
    );
  }
}
