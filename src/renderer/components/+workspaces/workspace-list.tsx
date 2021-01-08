import "./workspaces.scss";

import React from "react";
import { RouteComponentProps } from "react-router";
import { observer } from "mobx-react";
import { navigation } from "../../navigation";
import { workspaceListURL, IWorkspaceListRouteParams } from "./workspace-list.route";
import { TabLayout } from "../layout/tab-layout";
import { Badge } from "../badge";
import { ItemListLayout, ItemListLayoutProps } from "../item-object-list/item-list-layout";
import { AddWorkspaceDialog } from "./add-workspace-dialog";
import { Workspace, WorkspaceId } from "../../../common/workspace-store";
import { WorkspaceItem, workspaceListStore } from "./workspace-list.store";
import { WorkspaceDetails } from "./workspace-details";

enum sortBy {
  name = "name",
  description = "description",
}

interface Props extends RouteComponentProps<IWorkspaceListRouteParams> {
}

@observer
export class WorkspaceList extends React.Component<Props> {
  componentDidMount() {
    workspaceListStore.loadAll();
  }

  get selectedWorkspace() {
    const { match: { params: { workspaceName } } } = this.props;

    return workspaceListStore.getByName(workspaceName);
  }

  showDetails = (workspace: WorkspaceItem) => {
    if (!workspace) {
      navigation.merge(workspaceListURL());
    }
    else {
      navigation.merge(workspaceListURL({
        params: {
          workspaceName: workspace.getName(),
        }
      }));
    }
  };

  hideDetails = () => {
    this.showDetails(null);
  };

  render() {
    return (
      <TabLayout>
        <ItemListLayout
          isClusterScoped
          className="Workspaces" store={workspaceListStore}
          sortingCallbacks={{
            [sortBy.name]: (ws: WorkspaceItem) => ws.getName(),
            [sortBy.description]: (ws: WorkspaceItem) => ws.getDescription(),
          }}
          searchFilters={[]}
          renderHeaderTitle="Workspaces"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: sortBy.name },
            { title: "Description", className: "description", sortBy: sortBy.description },
          ]}
          renderTableContents={(item: WorkspaceItem) => [
            item.getName(),
            item.getDescription(),
          ]}
          addRemoveButtons={{
            addTooltip: "Add Workspace",
            onAdd: () => AddWorkspaceDialog.open(),
          }}
          detailsItem={this.selectedWorkspace}
          onDetails={this.showDetails}
        />
        {this.selectedWorkspace && (
          <WorkspaceDetails
            workspace={this.selectedWorkspace}
            hideDetails={this.hideDetails}
          />
        )}
        <AddWorkspaceDialog/>
      </TabLayout>
    );
  }
}
