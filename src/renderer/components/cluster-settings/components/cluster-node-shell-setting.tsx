/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { Cluster } from "../../../../common/cluster/cluster";
import { makeObservable, observable } from "mobx";
import { SubTitle } from "../../layout/sub-title";
import React from "react";
import { Input } from "../../input/input";
import { observer } from "mobx-react";
import { Icon } from "../../icon/icon";
import { initialNodeShellImage } from "../../../../common/cluster-types";

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterNodeShellSetting extends React.Component<Props> {
  @observable nodeShellImage = this.props.cluster.preferences?.nodeShellImage || "";
  @observable imagePullSecret = this.props.cluster.preferences?.imagePullSecret || "";

  constructor(props: Props) {
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
