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

import React from "react";
import type { Cluster } from "../../../../main/cluster";
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
