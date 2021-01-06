import "./workspaces.scss";

import React from "react";
import { TabLayout } from "../layout/tab-layout";
import { Badge } from "../badge";
import { ItemListLayout, ItemListLayoutProps } from "../item-object-list/item-list-layout";
import { Workspace, WorkspaceId } from "../../../common/workspace-store";
import { WorkspaceItem, workspaceListStore } from "./workspace-list.store";

enum sortBy {
  name = "name",
  id = "id",
}

export class WorkspaceList extends React.Component {
  componentDidMount() {
    workspaceListStore.loadAll();
  }

  render() {
    return (
      <TabLayout>
        <ItemListLayout
          isClusterScoped
          className="Workspaces" store={workspaceListStore}
          sortingCallbacks={{
            [sortBy.name]: (ws: WorkspaceItem) => ws.getName(),
            [sortBy.id]: (ws: WorkspaceItem) => ws.getId(),
          }}
          searchFilters={[]}
          renderHeaderTitle="Workspaces"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: sortBy.name },
            { title: "Id", className: "id", sortBy: sortBy.id },
          ]}
          renderTableContents={(item: WorkspaceItem) => [
            item.getName(),
            item.getId(),
          ]}
        />
      </TabLayout>
    );
  }
}
