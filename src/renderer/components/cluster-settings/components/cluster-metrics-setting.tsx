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
import { Select, SelectOption } from "../../select/select";
import { Icon } from "../../icon/icon";
import { Button } from "../../button/button";
import { SubTitle } from "../../layout/sub-title";
import type { Cluster } from "../../../../main/cluster";
import { observable, reaction, makeObservable } from "mobx";
import { ClusterMetricsResourceType } from "../../../../common/cluster-types";

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterMetricsSetting extends React.Component<Props> {
  @observable hiddenMetrics = observable.set<string>();

  constructor(props: Props) {
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

  onChangeSelect = (values: SelectOption<ClusterMetricsResourceType>[]) => {
    for (const { value } of values) {
      if (this.hiddenMetrics.has(value)) {
        this.hiddenMetrics.delete(value);
      } else {
        this.hiddenMetrics.add(value);
      }
    }
    this.save();
  };

  onChangeButton = () => {
    Object.keys(ClusterMetricsResourceType).map(value =>
      this.hiddenMetrics.add(value),
    );
    this.save();
  };

  reset = () => {
    this.hiddenMetrics.clear();
    this.save();
  };

  formatOptionLabel = ({ value: resource }: SelectOption<ClusterMetricsResourceType>) => (
    <div className="flex gaps align-center">
      <span>{resource}</span>
      {this.hiddenMetrics.has(resource) && <Icon smallest material="check" className="box right" />}
    </div>
  );

  renderMetricsSelect() {

    return (
      <>
        <Select
          className="box grow"
          placeholder="Select metrics to hide..."
          isMulti
          isSearchable
          onMenuClose={this.save}
          closeMenuOnSelect={false}
          controlShouldRenderValue={false}
          options={Object.values(ClusterMetricsResourceType)}
          onChange={this.onChangeSelect}
          formatOptionLabel={this.formatOptionLabel}
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
