import React from "react";
import { Cluster } from "../../../../main/cluster";
import { observer } from "mobx-react";
import { SubTitle } from "../../layout/sub-title";
import { autobind } from "../../../../common/utils";
import { shell } from "electron";

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterKubeconfig extends React.Component<Props> {

  @autobind()
  openKubeconfig() {
    const { cluster } = this.props;

    shell.showItemInFolder(cluster.kubeConfigPath);
  }

  render() {
    return (
      <>
        <SubTitle title="Kubeconfig" />

        <span>
          <a className="link value" onClick={this.openKubeconfig}>{this.props.cluster.kubeConfigPath}</a>
        </span>

      </>
    );
  }
}
