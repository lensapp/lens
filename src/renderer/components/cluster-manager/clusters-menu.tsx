import "./clusters-menu.scss"
import { remote } from "electron"
import React from "react";
import { observer } from "mobx-react";
import { _i18n } from "../../i18n";
import { t, Trans } from "@lingui/macro";
import type { Cluster } from "../../../main/cluster";
import { userStore } from "../../../common/user-store";
import { ClusterId, clusterStore } from "../../../common/cluster-store";
import { workspaceStore } from "../../../common/workspace-store";
import { ClusterIcon } from "../cluster-icon";
import { Icon } from "../icon";
import { autobind, cssNames, IClassName } from "../../utils";
import { Badge } from "../badge";
import { navigate } from "../../navigation";
import { addClusterURL } from "../+add-cluster";
import { clusterSettingsURL } from "../+cluster-settings";
import { landingURL } from "../+landing-page";
import { Tooltip } from "../tooltip";
import { ConfirmDialog } from "../confirm-dialog";
import { clusterIpc } from "../../../common/cluster-ipc";
import { clusterViewURL, getMatchedClusterId } from "./cluster-view.route";
import { DragDropContext, Draggable, DraggableProvided, Droppable, DroppableProvided, DropResult } from "react-beautiful-dnd";
import { dynamicPages } from "../../../extensions/register-page";

interface Props {
  className?: IClassName;
}

@observer
export class ClustersMenu extends React.Component<Props> {
  showCluster = (clusterId: ClusterId) => {
    clusterStore.setActive(clusterId);
    navigate(clusterViewURL({ params: { clusterId } }));
  }

  addCluster = () => {
    navigate(addClusterURL());
  }

  showContextMenu = (cluster: Cluster) => {
    const { Menu, MenuItem } = remote
    const menu = new Menu();

    menu.append(new MenuItem({
      label: _i18n._(t`Settings`),
      click: () => {
        navigate(clusterSettingsURL({
          params: {
            clusterId: cluster.id
          }
        }))
      }
    }));
    if (cluster.online) {
      menu.append(new MenuItem({
        label: _i18n._(t`Disconnect`),
        click: async () => {
          if (clusterStore.isActive(cluster.id)) {
            navigate(landingURL());
          }
          await clusterIpc.disconnect.invokeFromRenderer(cluster.id);
        }
      }))
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
        })
      }
    }));
    menu.popup({
      window: remote.getCurrentWindow()
    })
  }

  @autobind()
  swapClusterIconOrder(result: DropResult) {
    if (result.reason === "DROP") {
      const { currentWorkspaceId } = workspaceStore;
      const {
        source: { index: from },
        destination: { index: to },
      } = result
      clusterStore.swapIconOrders(currentWorkspaceId, from, to)
    }
  }

  render() {
    const { className } = this.props;
    const { newContexts } = userStore;
    const clusters = clusterStore.getByWorkspaceId(workspaceStore.currentWorkspaceId);
    return (
      <div className={cssNames("ClustersMenu flex column", className)}>
        <div className="clusters flex column gaps">
          <DragDropContext onDragEnd={this.swapClusterIconOrder}>
            <Droppable droppableId="cluster-menu" type="CLUSTER">
              {(provided: DroppableProvided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {clusters.map((cluster, index) => (
                    <Draggable draggableId={cluster.id} index={index} key={cluster.id}>
                      {(provided: DraggableProvided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <ClusterIcon
                            key={cluster.id}
                            showErrors={true}
                            cluster={cluster}
                            isActive={cluster.id === getMatchedClusterId()}
                            onClick={() => this.showCluster(cluster.id)}
                            onContextMenu={() => this.showContextMenu(cluster)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        <div className="add-cluster" onClick={this.addCluster}>
          <Tooltip targetId="add-cluster-icon">
            <Trans>Add Cluster</Trans>
          </Tooltip>
          <Icon big material="add" id="add-cluster-icon"/>
          {newContexts.size > 0 && (
            <Badge className="counter" label={newContexts.size} tooltip={<Trans>new</Trans>}/>
          )}
        </div>
        <div className="dynamic-pages">
          {dynamicPages.globalPages.map(({ path, components: { MenuIcon } }) => {
            return <MenuIcon key={path} onClick={() => navigate(path)}/>
          })}
        </div>
      </div>
    );
  }
}
