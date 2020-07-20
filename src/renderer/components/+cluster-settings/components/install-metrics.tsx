import React from "react";
import { Cluster } from "../../../../main/cluster";
import { Button } from "../../button";
import { autobind } from "../../../utils";
import { Tooltip, TooltipPosition } from "../../tooltip";
import { MetricsFeature } from "../../../../features/metrics";
import { Spinner } from "../../spinner";
import { Icon } from "../../icon";
import { clusterIpc } from "../../../../common/cluster-ipc";
import { observable } from "mobx";
import { ActionStatus } from "./statuses"
import { observer } from "mobx-react";

interface Props {
  cluster: Cluster;
}

@observer
export class InstallMetrics extends React.Component<Props> {
  @observable status = ActionStatus.IDLE;
  @observable errorText?: string;

  render() {
    return <>
      <h4>Metrics</h4>
      <p>
        User Mode feature enables non-admin users to see namespaces they have access to.
        This is achieved by configuring RBAC rules so that every authenticated user is granted to list namespaces.
      </p>
      <div className="center">
        {this.getActionButtons()}
      </div>
    </>;
  }

  getStatusIcon(): React.ReactNode {
    switch (this.status) {
    case ActionStatus.IDLE:
      return null;
    case ActionStatus.PROCESSING:
      return <Spinner />;
    case ActionStatus.ERROR:
      return <Icon size="16px" material="error" title={this.errorText}></Icon>
    }
  }

  getDisabledToolTip(id: string, action: string): React.ReactNode {
    const { cluster } = this.props;
    if (cluster.isAdmin) {
      return null;
    }

    return (
      <Tooltip targetId={id} position={TooltipPosition.TOP}>
        {action} only allowed by admins
      </Tooltip>
    );
  }

  getActionButtons(): React.ReactNode[] {
    const { cluster } = this.props
    const buttons = [];

    if (cluster.features[MetricsFeature.id]?.canUpgrade) {
      buttons.push(
        <Button key="upgrade" id="cluster-feature-metrics-upgrade" disabled={!cluster.isAdmin} primary onClick={this.runAction("upgradeFeature")}>
          Upgrade {this.getStatusIcon()} {this.getDisabledToolTip("cluster-feature-metrics-upgrade", "Upgrading")}
        </Button>
      );
    }

    if (cluster.features[MetricsFeature.id]?.installed) {
      buttons.push(
        <Button key="uninstall" id="cluster-feature-metrics-uninstall" disabled={!cluster.isAdmin} primary onClick={this.runAction("uninstallFeature")}>
          Uninstall {this.getStatusIcon()} {this.getDisabledToolTip("cluster-feature-metrics-uninstall", "Uninstalling")}
        </Button>
      );
    } else {
      buttons.push(
        <Button key="install" id="cluster-feature-metrics-install" disabled={!cluster.isAdmin} primary onClick={this.runAction("installFeature")}>
          Install {this.getStatusIcon()} {this.getDisabledToolTip("cluster-feature-metrics-install", "Installing")}
        </Button>
      );
    }

    return buttons;
  }

  runAction(action: keyof typeof clusterIpc): () => Promise<void> {
    return async () => {
      const { cluster } = this.props;
      console.log(`running ${action} ${MetricsFeature.id} onto ${cluster.preferences.clusterName}`);
  
      try {
        this.status = ActionStatus.PROCESSING
        await clusterIpc[action].invokeFromRenderer(cluster.id, MetricsFeature.id);
        try {
          await cluster.refresh();
        } catch (err) {
          console.error(err);
        }
        this.status = ActionStatus.IDLE
      } catch (err) {
        this.status = ActionStatus.ERROR
        this.errorText = err.toString()
      }
    };
  }
}