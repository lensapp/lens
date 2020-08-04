import React from "react";
import { Cluster } from "../../../../main/cluster";
import { Button } from "../../button";
import { MetricsFeature } from "../../../../features/metrics";
import { Spinner } from "../../spinner";
import { clusterIpc } from "../../../../common/cluster-ipc";
import { observable } from "mobx";
import { ActionStatus } from "./statuses"
import { observer } from "mobx-react";
import { SubTitle } from "../../layout/sub-title";
import { Notifications } from "../../notifications";

interface Props {
  cluster: Cluster;
}

@observer
export class InstallMetrics extends React.Component<Props> {
  @observable status = ActionStatus.IDLE;
  @observable errorText?: string;

  getActionButtons() {
    const { cluster } = this.props;
    const features = cluster.features[MetricsFeature.id];
    const disabled = !cluster.isAdmin || this.status === ActionStatus.PROCESSING;
    const loadingIcon = this.status === ActionStatus.PROCESSING ? <Spinner/> : null;
    if (!features) return null;
    return (
      <div className="flex gaps align-center">
        {features.canUpgrade &&
          <Button
            primary
            disabled={disabled}
            onClick={this.runAction("upgradeFeature")}
          >
            Upgrade
          </Button>
        }
        {features.installed &&
          <Button
            primary
            disabled={disabled}
            onClick={this.runAction("uninstallFeature")}
          >
            Uninstall
          </Button>
        }
        {!features.installed && !features.canUpgrade &&
          <Button
            primary
            disabled={disabled}
            onClick={this.runAction("installFeature")}
          >
            Install
          </Button>
        }
        {loadingIcon}
        {!cluster.isAdmin && <span className='admin-note'>Actions can only be performed by admins.</span>}
      </div>
    );
  }

  runAction(action: keyof typeof clusterIpc): () => Promise<void> {
    return async () => {
      const { cluster } = this.props;
      try {
        this.status = ActionStatus.PROCESSING
        await clusterIpc[action].invokeFromRenderer(cluster.id, MetricsFeature.id);
      } catch (err) {
        Notifications.error(err.toString());
      }
      this.status = ActionStatus.IDLE;
    };
  }

  render() {
    return (
      <>
        <SubTitle title="Metrics"/>
        <p>
          Enable timeseries data visualization (Prometheus stack) for your cluster.
          Install this only if you don't have existing Prometheus stack installed.
          You can see preview of manifests{" "}
          <a href="https://github.com/lensapp/lens/tree/master/src/features/metrics" target="_blank">here</a>.
        </p>
        {this.getActionButtons()}
      </>
    );
  }
}