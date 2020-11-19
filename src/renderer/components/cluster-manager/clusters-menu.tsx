import "./clusters-menu.scss";

import React from "react";
import { remote } from "electron";
import { requestMain } from "../../../common/ipc";
import type { Cluster } from "../../../main/cluster";
import { DragDropContext, Draggable, DraggableProvided, Droppable, DroppableProvided, DropResult } from "react-beautiful-dnd";
import { observer } from "mobx-react";
import { _i18n } from "../../i18n";
import { t, Trans } from "@lingui/macro";
import { userStore } from "../../../common/user-store";
import { ClusterId, clusterStore } from "../../../common/cluster-store";
import { workspaceStore } from "../../../common/workspace-store";
import { ClusterIcon } from "../cluster-icon";
import { Icon } from "../icon";
import { autobind, cssNames, IClassName } from "../../utils";
import { Badge } from "../badge";
import { navigate, navigation } from "../../navigation";
import { addClusterURL } from "../+add-cluster";
import { clusterSettingsURL } from "../+cluster-settings";
import { landingURL } from "../+landing-page";
import { Tooltip } from "../tooltip";
import { ConfirmDialog } from "../confirm-dialog";
import { clusterViewURL } from "./cluster-view.route";
import { getExtensionPageUrl, globalPageMenuRegistry, globalPageRegistry } from "../../../extensions/registries";
import { clusterDisconnectHandler } from "../../../common/cluster-ipc";

interface Props {
  className?: IClassName;
}

@observer
export class ClustersMenu extends React.Component<Props> {
  showCluster = (clusterId: ClusterId) => {
    navigate(clusterViewURL({ params: { clusterId } }));
  };

  addCluster = () => {
    navigate(addClusterURL());
  };

  showContextMenu = (cluster: Cluster) => {
    const { Menu, MenuItem } = remote;
    const menu = new Menu();

    menu.append(new MenuItem({
      label: _i18n._(t`Settings`),
      click: () => {
        navigate(clusterSettingsURL({
          params: {
            clusterId: cluster.id
          }
        }));
      }
    }));
    if (cluster.online) {
      menu.append(new MenuItem({
        label: _i18n._(t`Disconnect`),
        click: async () => {
          if (clusterStore.isActive(cluster.id)) {
            navigate(landingURL());
            clusterStore.setActive(null);
          }
          await requestMain(clusterDisconnectHandler, cluster.id);
        }
      }));
    }
    menu.append(new MenuItem({
      label: _i18n._(t`Remove`),
      click: () => {
        ConfirmDialog.open({
          okButtonProps: {
            primary: false,
            accent: true,
            label: _i18n._(t`Remove`),
          },
          ok: () => {
            if (clusterStore.activeClusterId === cluster.id) {
              navigate(landingURL());
            }
            clusterStore.removeById(cluster.id);
          },
          message: <p>Are you sure want to remove cluster <b title={cluster.id}>{cluster.contextName}</b>?</p>,
        });
      }
    }));
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
    const { newContexts } = userStore;
    const workspace = workspaceStore.getById(workspaceStore.currentWorkspaceId);
    const clusters = clusterStore.getByWorkspaceId(workspace.id);
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
        <div className="add-cluster">
          <Tooltip targetId="add-cluster-icon">
            <Trans>Add Cluster</Trans>
          </Tooltip>
          <Icon big material="add" id="add-cluster-icon" disabled={workspace.isManaged} onClick={this.addCluster}/>
          {newContexts.size > 0 && (
            <Badge className="counter" label={newContexts.size} tooltip={<Trans>new</Trans>}/>
          )}
        </div>
        <div className="extensions">
          {globalPageMenuRegistry.getItems().map(({ title, target, components: { Icon } }) => {
            const registeredPage = globalPageRegistry.getByPageMenuTarget(target);
            if (!registeredPage) return;
            const { extensionId, id: pageId } = registeredPage;
            const pageUrl = getExtensionPageUrl({ extensionId, pageId, params: target.params });
            const isActive = pageUrl === navigation.location.pathname;
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
