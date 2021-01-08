import "./workspace-details.scss";

import React, { Component } from "react";
import { WorkspaceItem } from "./workspace-list.store";
import { clusterStore } from "../../../common/cluster-store";
import { Cluster } from "../../../main/cluster";
import { observable, autorun } from "mobx";
import { observer } from "mobx-react";
import { Drawer, DrawerItem, DrawerTitle } from "../drawer";
import { autobind, stopPropagation } from "../../utils";
import { MarkdownViewer } from "../markdown-viewer";
import { Spinner } from "../spinner";
import { Button } from "../button";
import { Select, SelectOption } from "../select";
import { Badge } from "../badge";

interface Props {
  workspace: WorkspaceItem;
  hideDetails(): void;
}

@observer
export class WorkspaceDetails extends Component<Props> {

  renderClusters() {
    const { workspace } = this.props;
    const clusters = clusterStore.getByWorkspaceId(workspace.getId());
    return <div>
      {clusters.map(cluster => <div>{cluster.contextName}</div>)}
    </div>
  }

  render() {
    const { workspace, hideDetails } = this.props;
    const title = workspace ? <>Workspace: {workspace.getName()}</> : "";

    return (
      <Drawer
        className="WorkspaceDetails"
        usePortal={true}
        open={!!workspace}
        title={title}
        onClose={hideDetails}
      >
        <DrawerItem name={"Description"}>
          {workspace.getDescription()}
        </DrawerItem>
        <DrawerItem name={"Id"}>
          {workspace.getId()}
        </DrawerItem>
        <DrawerItem name={"Owner Ref"}>
          {workspace.getOwnerRef()}
        </DrawerItem>
        <DrawerItem name={"Enabled"} renderBoolean={true}>
          {workspace.getEnabled()}
        </DrawerItem>
        <DrawerTitle title={"Clusters"}/>
        {this.renderClusters()}
      </Drawer>
    );
  }
}
