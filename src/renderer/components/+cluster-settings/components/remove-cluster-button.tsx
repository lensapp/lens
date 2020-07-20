import React from "react";
import { Cluster } from "../../../../main/cluster";
import { Button } from "../../button";
import { autobind } from "../../../utils";
import { Spinner } from "../../spinner";
import { Icon } from "../../icon";
import { ConfirmDialog } from "../../confirm-dialog";
import { Trans } from "@lingui/macro";
import { clusterIpc } from "../../../../common/cluster-ipc";
import { clusterStore } from "../../../../common/cluster-store";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { RemovalStatus } from "./statuses"

interface Props {
    cluster: Cluster;
}

@observer
export class RemoveClusterButton extends React.Component<Props> {
  @observable status = RemovalStatus.PRESENT;
  @observable errorText?: string;

  render() {
    return (
      <div className="center">
        <Button accent onClick={this.confirmRemoveCluster}>Remove Cluster {this.getStatusIcon()}</Button>
      </div>
    );
  }

  getStatusIcon(): React.ReactNode {
    switch (this.status) {
    case RemovalStatus.PRESENT:
      return null;
    case RemovalStatus.PROCESSING:
      return <Spinner />;
    case RemovalStatus.ERROR:
      return <Icon size="16px" material="error" title={this.errorText}></Icon>;
    }
  }

    @autobind()
  confirmRemoveCluster() {
    const { cluster } = this.props;

    ConfirmDialog.open({
      message: <p>Are you sure you want to remove <b>{cluster.preferences.clusterName}</b> from Lens?</p>,
      labelOk: <Trans>Yes</Trans>,
      labelCancel: <Trans>No</Trans>,
      ok: async () => {
        try {
          this.status = RemovalStatus.PROCESSING;
          await clusterIpc.disconnect.invokeFromRenderer(cluster.id);
          await clusterStore.removeById(cluster.id);
        } catch (err) {
          this.status = RemovalStatus.ERROR;
          this.errorText = err.toString();
        }
      }
    })
  }
}