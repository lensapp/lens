import React from "react";
import { observer } from "mobx-react";
import { ClusterStore } from "../../../../common/cluster-store";
import { Cluster } from "../../../../main/cluster";
import { autobind } from "../../../utils";
import { Button } from "../../button";
import { ConfirmDialog } from "../../confirm-dialog";

interface Props {
  cluster: Cluster;
}

@observer
export class RemoveClusterButton extends React.Component<Props> {
  @autobind()
  confirmRemoveCluster() {
    const { cluster } = this.props;

    ConfirmDialog.open({
      message: <p>Are you sure you want to remove <b>{cluster.preferences.clusterName}</b> from Lens?</p>,
      labelOk: "Yes",
      labelCancel: "No",
      ok: async () => {
        await ClusterStore.getInstance().removeById(cluster.id);
      }
    });
  }

  render() {
    const { cluster } = this.props;

    return (
      <Button accent onClick={this.confirmRemoveCluster} className="button-area" disabled={cluster.isManaged}>
        Remove Cluster
      </Button>
    );
  }
}
