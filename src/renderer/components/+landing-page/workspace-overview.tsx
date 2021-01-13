import React, { Component } from "react";
import { Workspace } from "../../../common/workspace-store";
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
  workspace: Workspace;
}

@observer
export class WorkspaceOverview extends Component<Props> {

  renderClusters() {
    const { workspace } = this.props;
    const clusters = clusterStore.getByWorkspaceId(workspace.id);
    return <div>
      {clusters.map(cluster => <div>{cluster.contextName}</div>)}
    </div>
  }

  render() {
    const { workspace } = this.props;

    return (
        <Drawer
            className="WorkspaceDetails"
            usePortal={true}
            open={!!workspace}
            title={"Details"}
        >
            <DrawerItem name={"Description"}>
            {workspace.description}
            </DrawerItem>
            <DrawerItem name={"Id"}>
            {workspace.id}
            </DrawerItem>
            <DrawerItem name={"Owner Ref"}>
            {workspace.ownerRef}
            </DrawerItem>
            <DrawerItem name={"Enabled"} renderBoolean={true}>
            {workspace.enabled}
            </DrawerItem>
            <DrawerTitle title={"Clusters"}/>
            {this.renderClusters()}
        </Drawer>
    );
  }
}
