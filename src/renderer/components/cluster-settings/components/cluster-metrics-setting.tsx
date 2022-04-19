/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { Select } from "../../select/select";
import { Icon } from "../../icon/icon";
import { Button } from "../../button/button";
import { SubTitle } from "../../layout/sub-title";
import type { Cluster } from "../../../../common/cluster/cluster";
import { observable, reaction, makeObservable } from "mobx";
import { ClusterMetricsResourceType } from "../../../../common/cluster-types";

export interface ClusterMetricsSettingProps {
  cluster: Cluster;
}

@observer
export class ClusterMetricsSetting extends React.Component<ClusterMetricsSettingProps> {
  @observable hiddenMetrics = observable.set<string>();

  constructor(props: ClusterMetricsSettingProps) {
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

  save = () => {
    this.props.cluster.preferences.hiddenMetrics = Array.from(this.hiddenMetrics);
  };

  onChangeButton = () => {
    this.hiddenMetrics.replace(Object.keys(ClusterMetricsResourceType));
    this.save();
  };

  reset = () => {
    this.hiddenMetrics.clear();
    this.save();
  };

  renderMetricsSelect() {
    const metricResourceTypeOptions = Object.values(ClusterMetricsResourceType)
      .map(type => ({
        value: type,
        label: type,
        isSelected: this.hiddenMetrics.has(type),
      }));

    return (
      <>
        <Select
          id="cluster-metric-resource-type-input"
          className="box grow"
          placeholder="Select metrics to hide..."
          isMulti
          isSearchable
          onMenuClose={this.save}
          closeMenuOnSelect={false}
          controlShouldRenderValue={false}
          options={metricResourceTypeOptions}
          onChange={(options) => {
            this.hiddenMetrics.replace(options.map(opt => opt.value));
            this.save();
          }}
          formatOptionLabel={(option) => (
            <div className="flex gaps align-center">
              <span>{option.value}</span>
              {option.isSelected && (
                <Icon
                  smallest
                  material="check"
                  className="box right"
                />
              )}
            </div>
          )}
          themeName="lens"
        />
        <Button
          primary
          label="Hide all metrics"
          onClick={this.onChangeButton}
        />
        <Button
          primary
          label="Reset"
          onClick={this.reset}
        />
      </>
    );
  }

  render() {

    return (
      <div className="MetricsSelec0 mb-5">
        <SubTitle title={"Hide metrics from the UI"}/>
        <div className="flex gaps">
          {this.renderMetricsSelect()}
        </div>
      </div>
    );
  }
}
