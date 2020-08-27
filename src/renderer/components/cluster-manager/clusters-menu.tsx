import "./clusters-menu.scss"
import { remote } from "electron"
import React from "react";
import { observer } from "mobx-react";
import { observable } from "mobx";
import { _i18n } from "../../i18n";
import { t, Trans } from "@lingui/macro";
import type { Cluster } from "../../../main/cluster";
import { userStore } from "../../../common/user-store";
import { ClusterId, clusterStore } from "../../../common/cluster-store";
import { workspaceStore } from "../../../common/workspace-store";
import { ClusterIcon } from "../cluster-icon";
import { Icon } from "../icon";
import { cssNames, IClassName } from "../../utils";
import { Badge } from "../badge";
import { navigate, navigation } from "../../navigation";
import { addClusterURL } from "../+add-cluster";
import { clusterSettingsURL } from "../+cluster-settings";
import { landingURL } from "../+landing-page";
import { Tooltip } from "../tooltip";
import { ConfirmDialog } from "../confirm-dialog";
import { clusterIpc } from "../../../common/cluster-ipc";
import { clusterViewURL, getMatchedClusterId } from "./cluster-view.route";

// fixme: allow to rearrange clusters with drag&drop

interface Props {
  className?: IClassName;
}

@observer
export class ClustersMenu extends React.Component<Props> {
  @observable showHint = true;

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

  render() {
    const { className } = this.props;
    const { newContexts } = userStore;
    const clusters = clusterStore.getByWorkspaceId(workspaceStore.currentWorkspaceId);
    const noClustersInScope = clusters.length === 0;
    const isLanding = navigation.getPath() === landingURL();
    const showStartupHint = this.showHint && isLanding && noClustersInScope; // fixme: broken, move to landing.tsx
    return (
      <div
        className={cssNames("ClustersMenu flex column", className)}
        onMouseEnter={() => this.showHint = false}
      >
        {showStartupHint && (
          <div className="startup-tooltip flex column gaps">
            <p><Trans>This is the quick launch menu.</Trans></p>
            <p>
              <Trans>
                Associate clusters and choose the ones you want to access via quick launch menu by clicking the + button.
              </Trans>
            </p>
          </div>
        )}
        <div className="clusters flex column gaps">
          {clusters.map(cluster => {
            return (
              <ClusterIcon
                key={cluster.id}
                showErrors={true}
                cluster={cluster}
                isActive={cluster.id === getMatchedClusterId()}
                onClick={() => this.showCluster(cluster.id)}
                onContextMenu={() => this.showContextMenu(cluster)}
              />
            )
          })}
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
      </div>
    );
  }
}
