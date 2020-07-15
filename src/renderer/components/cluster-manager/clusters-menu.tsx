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
import { ClusterIcon } from "../+cluster-settings/cluster-icon";
import { Icon } from "../icon";
import { cssNames, IClassName } from "../../utils";
import { Badge } from "../badge";
import { navigate } from "../../navigation";
import { addClusterURL } from "../+add-cluster";
import { clusterSettingsURL } from "../+cluster-settings";
import { landingURL } from "../+landing-page";
import { Tooltip, TooltipContent } from "../tooltip";

// fixme: allow to rearrange clusters with drag&drop
// fixme: make add-icon's tooltip visible on init

interface Props {
  className?: IClassName;
}

@observer
export class ClustersMenu extends React.Component<Props> {
  showCluster = (clusterId: ClusterId) => {
    if (clusterStore.activeClusterId === clusterId) {
      navigate("/"); // redirect to index
    } else {
      clusterStore.activeClusterId = clusterId;
    }
  }

  addCluster = () => {
    navigate(addClusterURL());
  }

  showContextMenu = (cluster: Cluster) => {
    const { Menu, MenuItem } = remote
    const menu = new Menu();

    menu.append(new MenuItem({
      label: _i18n._(t`Settings`),
      click: () => navigate(clusterSettingsURL())
    }));

    // fixme: disconnect cluster
    if (cluster.initialized) {
      menu.append(new MenuItem({
        label: _i18n._(t`Disconnect`),
        click: () => {
          navigate(landingURL());
        }
      }))
    }
    menu.popup({
      window: remote.getCurrentWindow()
    })
  }

  render() {
    const { className } = this.props;
    const { newContexts } = userStore;
    const { currentWorkspaceId } = workspaceStore;
    const clusters = clusterStore.getByWorkspaceId(currentWorkspaceId);
    return (
      <div className={cssNames("ClustersMenu flex gaps column", className)}>
        {clusters.map(cluster => {
          return (
            <ClusterIcon
              key={cluster.id}
              showErrors={true}
              cluster={cluster}
              isActive={cluster.id === clusterStore.activeClusterId}
              onClick={() => this.showCluster(cluster.id)}
              onContextMenu={() => this.showContextMenu(cluster)}
            />
          )
        })}
        <div id="add-cluster" onClick={this.addCluster}>
          <Tooltip htmlFor="add-cluster" position={{ right: true }}>
            <TooltipContent>
              <Trans>This is the quick launch menu.</Trans>
              <br/><br/>
              <Trans>
                Associate clusters and choose the ones you want to access via quick launch menu by clicking the + button.
              </Trans>
            </TooltipContent>
          </Tooltip>
          <Icon big material="add"/>
          {newContexts.length > 0 && (
            <Badge className="counter" label={newContexts.length}/>
          )}
        </div>
      </div>
    );
  }
}
