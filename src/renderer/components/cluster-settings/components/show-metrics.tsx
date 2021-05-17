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
import { disposeOnUnmount, observer } from "mobx-react";
import { Cluster } from "../../../../main/cluster";
import { observable, reaction } from "mobx";
import { Badge } from "../../badge/badge";
import { Icon } from "../../icon/icon";

interface Props {
  cluster: Cluster;
}

@observer
export class ShowMetricsSetting extends React.Component<Props> {
  @observable hiddenMetrics = observable.set<string>();

  componentDidMount() {
    this.hiddenMetrics = observable.set<string>(this.props.cluster.preferences.hiddenMetrics ?? []);

    disposeOnUnmount(this, [
      reaction(() => this.props.cluster.preferences.hiddenMetrics, () => {
        this.hiddenMetrics = observable.set<string>(this.props.cluster.preferences.hiddenMetrics ?? []);
      }),
    ]);
  }

  removeMetric(metric: string) {
    this.hiddenMetrics.delete(metric);
    this.props.cluster.preferences.hiddenMetrics = Array.from(this.hiddenMetrics);
  }

  renderMetrics() {

    return (

      Array.from(this.hiddenMetrics).map(name => {
        const tooltipId = `${name}`;

        return (
          <Badge key={name}>
            <span id={tooltipId}>{name}</span>
            <Icon
              smallest
              material="clear"
              onClick={() => this.removeMetric(name)}
              tooltip="Remove"
            />
          </Badge>
        );
      })
    );
  }

  render() {

    return (
      <div className="MetricsSelect flex wrap gaps">
        {this.renderMetrics()}
      </div>
    );
  }
}
