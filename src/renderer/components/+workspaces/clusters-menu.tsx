import type { Cluster } from "../../../main/cluster";

import "./clusters-menu.scss"
import { remote } from "electron"
import React from "react";
import { observer } from "mobx-react";
import { _i18n } from "../../i18n";
import { t, Trans } from "@lingui/macro";
import { ClusterId, clusterStore } from "../../../common/cluster-store";
import { WorkspaceId } from "../../../common/workspace-store";
import { ClusterIcon } from "../+cluster-settings/cluster-icon";
import { Icon } from "../icon";
import { cssNames, IClassName } from "../../utils";

interface Props {
  className?: IClassName;
  workspaceId?: WorkspaceId;
}

@observer
export class ClustersMenu extends React.Component<Props> {
  selectCluster = (cluster: Cluster) => {
    clusterStore.activeCluster = cluster.id;
    console.log('load lens for cluster:', cluster)
  }

  addCluster = () => {
    console.log('navigate: /add-cluster')
  }

  showContextMenu = (clusterId: ClusterId) => {
    const { Menu, MenuItem } = remote
    const menu = new Menu();

    menu.append(new MenuItem({
      label: _i18n._(t`Settings`),
      click: () => {
        console.log(`navigate to cluster=${clusterId} settings`)
      }
    }))
    // fixme: don't show item if cluster wasn't active during runtime
    menu.append(new MenuItem({
      label: _i18n._(t`Disconnect`),
      click: () => {
        console.log(`disconnect cluster=${clusterId} and navigate to landing-page`)
      }
    }))

    menu.popup({
      window: remote.getCurrentWindow()
    })
  }

  // fixme: allow to rearrange clusters with drag&drop
  render() {
    const { workspaceId, className } = this.props;
    const clusters = clusterStore.getByWorkspaceId(workspaceId);
    const addClusterTooltip = (
      <div className="flex column gaps">
        <p><Trans>This is the quick launch menu.</Trans></p>
        <p>
          <Trans>
            Associate clusters and choose the ones you want to access via quick launch menu by clicking the + button.
          </Trans>
        </p>
      </div>
    )
    return (
      <div className={cssNames("ClustersMenu flex gaps column", className)}>
        {clusters.map(cluster => {
          const isActive = cluster.id === clusterStore.activeCluster;
          return (
            <ClusterIcon
              key={cluster.id}
              cluster={cluster}
              className={cssNames({ active: isActive })}
              onClick={() => this.selectCluster(cluster)}
              onContextMenu={() => this.showContextMenu(cluster.id)}
            />
          )
        })}
        {/* todo: add badge for "newContexts" since last visit */}
        {/* fixme: make tooltip visible on init + remove following to mouse pos */}
        <Icon
          big material="add"
          className="add-cluster"
          tooltip={{ children: addClusterTooltip }}
          onClick={this.addCluster}
        />
      </div>
    );
  }
}
