/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../../../../common/cluster/cluster";
import { makeObservable, observable } from "mobx";
import { SubTitle } from "../../layout/sub-title";
import React from "react";
import { Input } from "../../input/input";
import { observer } from "mobx-react";
import { Icon } from "../../icon/icon";
import { initialNodeShellImage } from "../../../../common/cluster/types";

export interface ClusterNodeShellSettingProps {
  cluster: Cluster;
}

@observer
export class ClusterNodeShellSetting extends React.Component<ClusterNodeShellSettingProps> {
  @observable nodeShellImage = this.props.cluster.preferences?.nodeShellImage || "";
  @observable imagePullSecret = this.props.cluster.preferences?.imagePullSecret || "";

  constructor(props: ClusterNodeShellSettingProps) {
    super(props);
    makeObservable(this);
  }

  componentWillUnmount() {
    this.props.cluster.preferences ??= {};
    this.props.cluster.preferences.nodeShellImage = this.nodeShellImage || undefined;
    this.props.cluster.preferences.imagePullSecret = this.imagePullSecret || undefined;
  }

  render() {
    return (
      <>
        <section>
          <SubTitle title="Node shell image" id="node-shell-image"/>
          <Input
            theme="round-black"
            placeholder={`Default image: ${initialNodeShellImage}`}
            value={this.nodeShellImage}
            onChange={value => this.nodeShellImage = value}
            iconRight={
              this.nodeShellImage
                ? (
                  <Icon
                    smallest
                    material="close"
                    onClick={() => this.nodeShellImage = ""}
                    tooltip="Reset"
                  />
                )
                : undefined
            }
          />
          <small className="hint">
            Node shell image. Used for creating node shell pod.
          </small>
        </section>
        <section>
          <SubTitle title="Image pull secret" id="image-pull-secret"/>
          <Input
            placeholder="Specify a secret name..."
            theme="round-black"
            value={this.imagePullSecret}
            onChange={value => this.imagePullSecret = value}
            iconRight={
              this.imagePullSecret
                ? (
                  <Icon
                    smallest
                    material="close"
                    onClick={() => this.imagePullSecret = ""}
                    tooltip="Clear"
                  />
                )
                : undefined
            }
          />
          <small className="hint">
            Name of a pre-existing secret in the kube-system namespace. An optional setting. Used for pulling image from a private registry.
          </small>
        </section>
      </>
    );
  }
}
