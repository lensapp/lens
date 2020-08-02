import React from "react";
import { Cluster } from "../../../../main/cluster";
import { clusterStore } from "../../../../common/cluster-store"
import { Select, SelectOption, SelectProps } from "../../select";
import { prometheusProviders } from "../../../../common/prometheus-providers";
import { autobind } from "../../../utils";
import { observable } from "mobx";
import { observer } from "mobx-react";

const prometheusGuide = "https://github.com/lensapp/lens/blob/master/troubleshooting/custom-prometheus.md";
const options: SelectOption<string>[] = [
  { value: "", label: "Auto detect" }, 
  ...prometheusProviders.map(pp => ({value: pp.id, label: pp.name}))
];

interface Props {
    cluster: Cluster;
}

@observer
export class ClusterPrometheusSetting extends React.Component<Props> {
  @observable prometheusProvider = this.props.cluster.preferences.prometheusProvider?.type || "";
  
  render() {
    return <>
      <h4>Cluster Prometheus</h4>
      <p>Use pre-installed Prometheus service for metrics. Please refer to <a href={prometheusGuide}>this guide</a> for possible configuration changes.</p>
      <Select
        value={this.prometheusProvider}
        options={options}
        onChange={this.changePrometheusProvider}
      />
    </>;
  }

  @autobind()
  changePrometheusProvider({ value: prometheusProvider }: SelectProps<string>) {
    this.prometheusProvider = prometheusProvider;
    this.props.cluster.preferences.prometheusProvider = { type: prometheusProvider };
  }
}