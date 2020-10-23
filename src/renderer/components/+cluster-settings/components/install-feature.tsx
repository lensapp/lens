import React from "react";
import { observable, reaction, comparer } from "mobx";
import { observer, disposeOnUnmount } from "mobx-react";
import { Cluster } from "../../../../main/cluster";
import { Button } from "../../button";
import { Notifications } from "../../notifications";
import { Spinner } from "../../spinner";
import { Feature, FeatureStatus } from "../../../../main/feature";

interface Props {
  cluster: Cluster
  feature: Feature
}

@observer
export class InstallFeature extends React.Component<Props> {
  @observable loading = false;
  @observable status: FeatureStatus

  componentDidMount() {
    this.props.feature.featureStatus(this.props.cluster).then((status) => {
      this.status = status
    })
    disposeOnUnmount(this,
      reaction(() => this.status, () => {
        this.loading = false;
      }, { equals: comparer.structural })
    );
  }

  getActionButtons() {
    const { cluster, feature } = this.props;
    const disabled = !cluster.isAdmin || this.loading;
    const loadingIcon = this.loading ? <Spinner/> : null;
    const features = this.status
    if (!features) return null
    return (
      <div className="flex gaps align-center">
        {features.canUpgrade &&
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
        {features.installed &&
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
        {!features.installed && !features.canUpgrade &&
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
