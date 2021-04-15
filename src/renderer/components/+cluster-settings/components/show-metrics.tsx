import "./cluster-metrics-setting.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { Cluster } from "../../../../main/cluster";
import { observable, reaction } from "mobx";
import { Badge } from "../../badge/badge";
import { IconButton, Tooltip } from "@material-ui/core";
import { Clear } from "@material-ui/icons";

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

      Array.from(this.hiddenMetrics).map(name => (
        <Badge key={name}>
          <span>{name}</span>
          <Tooltip title="Remove">
            <IconButton onClick={() => this.removeMetric(name)}>
              <Clear fontSize="small" />
            </IconButton>
          </Tooltip>
        </Badge>
      ))
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
