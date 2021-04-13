import "./cluster-metrics-setting.scss";

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
