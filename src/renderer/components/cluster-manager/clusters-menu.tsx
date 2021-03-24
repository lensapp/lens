import "./clusters-menu.scss";

import React from "react";
import { remote } from "electron";
import type { Cluster } from "../../../main/cluster";
import { DragDropContext, Draggable, DraggableProvided, Droppable, DroppableProvided, DropResult } from "react-beautiful-dnd";
import { observer } from "mobx-react";
import { ClusterId, clusterStore } from "../../../common/cluster-store";
import { workspaceStore } from "../../../common/workspace-store";
import { ClusterIcon } from "../cluster-icon";
import { Icon } from "../icon";
import { autobind, cssNames, IClassName } from "../../utils";
import { isActiveRoute, navigate } from "../../navigation";
import { addClusterURL } from "../+add-cluster";
import { landingURL } from "../+landing-page";
import { clusterViewURL } from "./cluster-view.route";
import { ClusterActions } from "./cluster-actions";
import { getExtensionPageUrl, globalPageMenuRegistry, globalPageRegistry } from "../../../extensions/registries";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { CommandOverlay } from "../command-palette/command-container";
import { computed, observable } from "mobx";
import { Select } from "../select";
import { Menu, MenuItem } from "../menu";

interface Props {
  className?: IClassName;
}

@observer
export class ClustersMenu extends React.Component<Props> {
  @observable workspaceMenuVisible = false;

  showCluster = (clusterId: ClusterId) => {
    navigate(clusterViewURL({ params: { clusterId } }));
  };

  showContextMenu = (cluster: Cluster) => {
    const { Menu, MenuItem } = remote;
    const menu = new Menu();
    const actions = ClusterActions(cluster);

    menu.append(new MenuItem({
      label: `Settings`,
      click: actions.showSettings
    }));

    if (cluster.online) {
      menu.append(new MenuItem({
        label: `Disconnect`,
        click: actions.disconnect
      }));
    }

    if (!cluster.isManaged) {
      menu.append(new MenuItem({
        label: `Remove`,
        click: actions.remove
      }));
    }
    menu.popup({
      window: remote.getCurrentWindow()
    });
  };

  @autobind()
  swapClusterIconOrder(result: DropResult) {
    if (result.reason === "DROP") {
      const { currentWorkspaceId } = workspaceStore;
      const {
        source: { index: from },
        destination: { index: to },
      } = result;

      clusterStore.swapIconOrders(currentWorkspaceId, from, to);
    }
  }

  render() {
    const { className } = this.props;
    const workspace = workspaceStore.getById(workspaceStore.currentWorkspaceId);
    const clusters = clusterStore.getByWorkspaceId(workspace.id).filter(cluster => cluster.enabled);
    const activeClusterId = clusterStore.activeCluster;

    return (
      <div className={cssNames("ClustersMenu flex column", className)}>
        <div className="clusters flex column gaps">
          <DragDropContext onDragEnd={this.swapClusterIconOrder}>
            <Droppable droppableId="cluster-menu" type="CLUSTER">
              {({ innerRef, droppableProps, placeholder }: DroppableProvided) => (
                <div ref={innerRef} {...droppableProps}>
                  {clusters.map((cluster, index) => {
                    const isActive = cluster.id === activeClusterId;

                    return (
                      <Draggable draggableId={cluster.id} index={index} key={cluster.id}>
                        {({ draggableProps, dragHandleProps, innerRef }: DraggableProvided) => (
                          <div ref={innerRef} {...draggableProps} {...dragHandleProps}>
                            <ClusterIcon
                              key={cluster.id}
                              showErrors={true}
                              cluster={cluster}
                              isActive={isActive}
                              onClick={() => this.showCluster(cluster.id)}
                              onContextMenu={() => this.showContextMenu(cluster)}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="WorkspaceMenu">
          <Icon big material="menu" id="workspace-menu-icon" data-test-id="workspace-menu" />
          <Menu
            usePortal
            htmlFor="workspace-menu-icon"
            className="WorkspaceMenu"
            isOpen={this.workspaceMenuVisible}
            open={() => this.workspaceMenuVisible = true}
            close={() => this.workspaceMenuVisible = false}
            toggleEvent="click"
          >
            <MenuItem onClick={() => navigate(addClusterURL())} data-test-id="add-cluster-menu-item">
              <Icon small material="add" /> Add Cluster
            </MenuItem>
            <MenuItem onClick={() => navigate(landingURL())} data-test-id="workspace-overview-menu-item">
              <Icon small material="dashboard" /> Workspace Overview
            </MenuItem>
          </Menu>
        </div>
        <div className="extensions">
          {globalPageMenuRegistry.getItems().map(({ title, target, components: { Icon } }) => {
            const registeredPage = globalPageRegistry.getByPageTarget(target);

            if (!registeredPage){
              return;
            }
            const pageUrl = getExtensionPageUrl(target);
            const isActive = isActiveRoute(registeredPage.url);

            return (
              <Icon
                key={pageUrl}
                tooltip={title}
                active={isActive}
                onClick={() => navigate(pageUrl)}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

@observer
export class ChooseCluster extends React.Component {
  @computed get options() {
    const clusters = clusterStore.getByWorkspaceId(workspaceStore.currentWorkspaceId).filter(cluster => cluster.enabled);
    const options = clusters.map((cluster) => {
      return { value: cluster.id, label: cluster.name };
    });

    return options;
  }

  onChange(clusterId: string) {
    navigate(clusterViewURL({ params: { clusterId } }));
    CommandOverlay.close();
  }

  render() {
    return (
      <Select
        onChange={(v) => this.onChange(v.value)}
        components={{ DropdownIndicator: null, IndicatorSeparator: null }}
        menuIsOpen={true}
        options={this.options}
        autoFocus={true}
        escapeClearsValue={false}
        placeholder="Switch to cluster" />
    );
  }
}


commandRegistry.add({
  id: "workspace.chooseCluster",
  title: "Workspace: Switch to cluster ...",
  scope: "global",
  action: () => CommandOverlay.open(<ChooseCluster />)
});
