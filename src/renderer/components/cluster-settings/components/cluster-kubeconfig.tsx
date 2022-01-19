/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { Cluster } from "../../../../common/cluster/cluster";
import { observer } from "mobx-react";
import { SubTitle } from "../../layout/sub-title";
import { boundMethod } from "../../../../common/utils";
import { shell } from "electron";
import { Notice } from "../../+extensions/notice";

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterKubeconfig extends React.Component<Props> {

  @boundMethod
  openKubeconfig() {
    const { cluster } = this.props;

    shell.showItemInFolder(cluster.kubeConfigPath);
  }

  render() {
    return (
      <Notice className="mb-14 mt-3">
        <SubTitle title="Kubeconfig" />
        <span>
          <a className="link value" onClick={this.openKubeconfig}>{this.props.cluster.kubeConfigPath}</a>
        </span>
      </Notice>
    );
  }
}
