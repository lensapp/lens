/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../../../common/cluster/cluster";
import { makeObservable, observable, runInAction } from "mobx";
import { SubTitle } from "../layout/sub-title";
import React from "react";
import { Input } from "../input/input";
import { observer } from "mobx-react";
import { Icon } from "@k8slens/icon";
import { initialNodeShellImage, initialNodeShellWindowsImage } from "../../../common/cluster-types";
import Gutter from "../gutter/gutter";

export interface ClusterNodeShellSettingProps {
  cluster: Cluster;
}

@observer
export class ClusterNodeShellSetting extends React.Component<ClusterNodeShellSettingProps> {
  @observable nodeShellImage = this.props.cluster.preferences?.nodeShellImage || "";
  @observable nodeShellWindowsImage = this.props.cluster.preferences?.nodeShellWindowsImage || "";
  @observable imagePullSecret = this.props.cluster.preferences?.imagePullSecret || "";

  constructor(props: ClusterNodeShellSettingProps) {
    super(props);
    makeObservable(this);
  }

  componentWillUnmount() {
    runInAction(() => {
      this.props.cluster.preferences.nodeShellImage = this.nodeShellImage || undefined;
      this.props.cluster.preferences.nodeShellWindowsImage = this.nodeShellWindowsImage || undefined;
      this.props.cluster.preferences.imagePullSecret = this.imagePullSecret || undefined;
    });
  }

  render() {
    return (
      <>
        <section>
          <SubTitle title="Node shell image for Linux" id="node-shell-image"/>
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
            Node shell image. Used for creating node shell pod on Linux nodes.
          </small>
        </section>
        <Gutter />
        <section>
          <SubTitle title="Node shell image for Windows" id="node-shell-windows-image"/>
          <Input
            theme="round-black"
            placeholder={`Default image: ${initialNodeShellWindowsImage}`}
            value={this.nodeShellWindowsImage}
            onChange={value => this.nodeShellWindowsImage = value}
            iconRight={
              this.nodeShellWindowsImage
                ? (
                  <Icon
                    smallest
                    material="close"
                    onClick={() => this.nodeShellWindowsImage = ""}
                    tooltip="Reset"
                  />
                )
                : undefined
            }
          />
          <small className="hint">
            Node shell image. Used for creating node shell pod on Windows nodes.
          </small>
        </section>
        <Gutter />
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
