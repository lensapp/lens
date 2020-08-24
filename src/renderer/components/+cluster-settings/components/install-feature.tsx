import React from "react";
import { observable, reaction, comparer } from "mobx";
import { observer, disposeOnUnmount } from "mobx-react";
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

  componentDidMount() {
    disposeOnUnmount(this,
      reaction(() => this.props.cluster.features[this.props.feature], () => {
        this.loading = false;
      }, { equals: comparer.structural })
    );
  }

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
            onClick={this.runAction(() =>
              clusterIpc.upgradeFeature.invokeFromRenderer(cluster.id, feature))
            }
          >
            Upgrade
          </Button>
        }
        {features.installed &&
          <Button
            accent
            disabled={disabled}
            onClick={this.runAction(() =>
              clusterIpc.uninstallFeature.invokeFromRenderer(cluster.id, feature))
            }
          >
            Uninstall
          </Button>
        }
        {!features.installed && !features.canUpgrade &&
          <Button
            primary
            disabled={disabled}
            onClick={this.runAction(() =>
              clusterIpc.installFeature.invokeFromRenderer(cluster.id, feature))
            }
          >
            Install
          </Button>
        }
        {loadingIcon}
        {!cluster.isAdmin && <span className='admin-note'>Actions can only be performed by admins.</span>}
      </div>
    );
  }

  runAction(action: () => Promise<any>): () => Promise<void> {
    return async () => {
      try {
        this.loading = true;
        await action();
      } catch (err) {
        Notifications.error(err.toString());
      }
    };
  }

  render() {
    return (
      <>
        {this.props.children}
        <div className="button-area">{this.getActionButtons()}</div>
      </>
    );
  }
}