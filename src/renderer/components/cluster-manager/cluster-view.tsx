import "./cluster-view.scss";
import React from "react";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { IClusterViewRouteParams } from "./cluster-view.route";
import { ClusterStatus } from "./cluster-status";
import { hasLoadedView } from "./lens-views";
import { Cluster } from "../../../main/cluster";
import { navigate } from "../../navigation";
import { catalogURL } from "../+catalog";
import { ClusterStore } from "../../../common/cluster-store";

interface Props extends RouteComponentProps<IClusterViewRouteParams> {
}

@observer
export class ClusterView extends React.Component<Props> {
  get clusterId() {
    return this.props.match.params.clusterId;
  }

  get cluster(): Cluster {
    return ClusterStore.getInstance().getById(this.clusterId);
  }

  async componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.clusterId, clusterId => ClusterStore.getInstance().setActive(clusterId), {
        fireImmediately: true,
      }),
      reaction(() => this.cluster.online, (online) => {
        if (!online) navigate(catalogURL());
      })
    ]);
  }

  render() {
    const { cluster } = this;
    const showStatus = cluster && (!cluster.available || !hasLoadedView(cluster.id) || !cluster.ready);

    return (
      <div className="ClusterView flex align-center">
        {showStatus && (
          <ClusterStatus key={cluster.id} clusterId={cluster.id} className="box center"/>
        )}
      </div>
    );
  }
}
