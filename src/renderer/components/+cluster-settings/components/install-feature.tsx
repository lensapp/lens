import React from "react";
import { observable, reaction, comparer } from "mobx";
import { observer, disposeOnUnmount } from "mobx-react";
import { Cluster } from "../../../../main/cluster";
import { Button } from "../../button";
import { Notifications } from "../../notifications";
import { Spinner } from "../../spinner";
import { Feature } from "../../../../main/feature";
import { interval } from "../../../utils";

interface Props {
  cluster: Cluster
  feature: Feature
}

@observer
export class InstallFeature extends React.Component<Props> {
  @observable loading = false;

  componentDidMount() {
    const feature = this.props.feature
    const cluster = this.props.cluster
    const statusUpdate = interval(20, () => {
      feature.updateStatus(cluster)
    })
    statusUpdate.start(true)

    disposeOnUnmount(this, () => {
      statusUpdate.stop()
    })

    disposeOnUnmount(this,
      reaction(() => feature.status.installed, () => {
        this.loading = false;
      }, { equals: comparer.structural })
    );
  }

  getActionButtons() {
    const { cluster, feature } = this.props;
    const disabled = !cluster.isAdmin || this.loading;
    const loadingIcon = this.loading ? <Spinner/> : null;
    return (
      <div className="flex gaps align-center">
        {feature.status.canUpgrade &&
          <Button
            primary
            disabled={disabled}
            onClick={this.runAction(() =>
              feature.upgrade(cluster)
            )}
          >
            Upgrade
          </Button>
        }
        {feature.status.installed &&
          <Button
            accent
            disabled={disabled}
            onClick={this.runAction(() =>
              feature.uninstall(cluster)
            )}
          >
            Uninstall
          </Button>
        }
        {!feature.status.installed && !feature.status.canUpgrade &&
          <Button
            primary
            disabled={disabled}
            onClick={this.runAction(() =>
              feature.install(cluster)
            )}
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
