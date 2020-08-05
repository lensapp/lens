import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { clusterIpc } from "../../../../common/cluster-ipc";
import { Cluster } from "../../../../main/cluster";
import { Button } from "../../button";
import { Notifications } from "../../notifications";
import { Spinner } from "../../spinner";

interface Props {
  cluster: Cluster
  feature: string
}

@observer
export class InstallFeature extends React.Component<Props> {
  @observable loading = false;

  getActionButtons() {
    const { cluster, feature } = this.props;
    const features = cluster.features[feature];
    const disabled = !cluster.isAdmin || this.loading;
    const loadingIcon = this.loading ? <Spinner/> : null;
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
      const { cluster, feature } = this.props;
      try {
        this.loading = true;
        await clusterIpc[action].invokeFromRenderer(cluster.id, feature);
      } catch (err) {
        Notifications.error(err.toString());
      }
      this.loading = false;
    };
  }

  render() {
    return (
      <>
        {this.props.children}
        {this.getActionButtons()}
      </>
    );
  }
}