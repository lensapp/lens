/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { Cluster } from "../../../../common/cluster/cluster";
import { Input } from "../../input";
import { observable, autorun, makeObservable } from "mobx";
import { observer, disposeOnUnmount } from "mobx-react";
import { SubTitle } from "../../layout/sub-title";
import { isRequired } from "../../input/input_validators";
import type { KubernetesCluster } from "../../../../common/catalog-entities";

interface Props {
  cluster: Cluster;
  entity: KubernetesCluster;
}

@observer
export class ClusterNameSetting extends React.Component<Props> {
  @observable name = "";

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this,
      autorun(() => {
        this.name = this.props.cluster.preferences.clusterName || this.props.entity.metadata.name;
      }),
    );
  }

  save = () => {
    this.props.cluster.preferences.clusterName = this.name;
  };

  onChange = (value: string) => {
    this.name = value;
  };

  render() {
    return (
      <>
        <SubTitle title="Cluster Name" />
        <Input
          theme="round-black"
          validators={isRequired}
          value={this.name}
          onChange={this.onChange}
          onBlur={this.save}
        />
      </>
    );
  }
}
