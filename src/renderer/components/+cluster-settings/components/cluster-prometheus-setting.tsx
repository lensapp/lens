import React from "react";
import merge from "lodash/merge";
import { observer } from "mobx-react";
import { prometheusProviders } from "../../../../common/prometheus-providers";
import { Cluster } from "../../../../main/cluster";
import { SubTitle } from "../../layout/sub-title";
import { Select, SelectOption } from "../../select";

const options: SelectOption<string>[] = [
  { value: "", label: "Auto detect" },
  ...prometheusProviders.map(pp => ({value: pp.id, label: pp.name}))
];

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterPrometheusSetting extends React.Component<Props> {
  render() {
    return (
      <>
        <SubTitle title="Prometheus"/>
        <p>
          Use pre-installed Prometheus service for metrics. Please refer to the{" "}
          <a href="https://github.com/lensapp/lens/blob/master/troubleshooting/custom-prometheus.md" target="_blank">guide</a>{" "}
          for possible configuration changes.
        </p>
        <Select
          value={this.props.cluster.preferences.prometheusProvider?.type || ""}
          onChange={({value}) => {
            const provider = {
              prometheusProvider: {
                type: value
              }
            }
            merge(this.props.cluster.preferences, provider);
          }}
          options={options}
        />
      </>
    );
  }
}