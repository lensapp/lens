/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import type { Cluster } from "../../../../common/cluster/cluster";
import { observable, reaction, makeObservable } from "mobx";
import { Badge } from "../../badge/badge";
import { Icon } from "../../icon/icon";
import { Notice } from "../../+extensions/notice";

export interface ShowMetricsSettingProps {
  cluster: Cluster;
}

@observer
export class ShowMetricsSetting extends React.Component<ShowMetricsSettingProps> {
  @observable hiddenMetrics = observable.set<string>();

  constructor(props: ShowMetricsSettingProps) {
    super(props);
    makeObservable(this);
  }

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
    const metrics = Array.from(this.hiddenMetrics);

    if (!metrics.length) {
      return (
        <div className="flex-grow text-center">All metrics are visible on the UI</div>
      );
    }

    return (
      metrics.map(name => {
        const tooltipId = `${name}`;

        return (
          <Badge
            key={name}
            flat
            expandable={false}
          >
            <span id={tooltipId}>{name}</span>
            <Icon
              smallest
              material="clear"
              onClick={() => this.removeMetric(name)}
              tooltip="Remove"
              className="mx-3"
            />
          </Badge>
        );
      })
    );
  }

  render() {

    return (
      <Notice>
        <div className="MetricsSelect flex wrap gaps leading-relaxed">
          {this.renderMetrics()}
        </div>
      </Notice>
    );
  }
}
