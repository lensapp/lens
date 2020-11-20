import React from "react";
import { observer, disposeOnUnmount } from "mobx-react";
import { prometheusProviders } from "../../../../common/prometheus-providers";
import { Cluster } from "../../../../main/cluster";
import { SubTitle } from "../../layout/sub-title";
import { Select, SelectOption } from "../../select";
import { Input } from "../../input";
import { observable, computed, autorun } from "mobx";

const options: SelectOption<string>[] = [
  { value: "", label: "Auto detect" },
  ...prometheusProviders.map(pp => ({value: pp.id, label: pp.name}))
];

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterPrometheusSetting extends React.Component<Props> {
  @observable path = "";
  @observable provider = "";

  @computed get canEditPrometheusPath() {
    if (this.provider === "" || this.provider === "lens") return false;
    return true;
  }

  componentDidMount() {
    disposeOnUnmount(this,
      autorun(() => {
        const { prometheus, prometheusProvider } = this.props.cluster.preferences;
        if (prometheus) {
          const prefix = prometheus.prefix || "";
          this.path = `${prometheus.namespace}/${prometheus.service}:${prometheus.port}${prefix}`;
        } else {
          this.path = "";
        }
        if (prometheusProvider) {
          this.provider = prometheusProvider.type;
        } else {
          this.provider = "";
        }
      })
    );
  }

  parsePrometheusPath = () => {
    if (!this.provider || !this.path) {
      return null;
    }
    const parsed = this.path.split(/\/|:/, 3);
    const apiPrefix = this.path.substring(parsed.join("/").length);
    if (!parsed[0] || !parsed[1] || !parsed[2]) {
      return null;
    }
    return {
      namespace: parsed[0],
      service: parsed[1],
      port: parseInt(parsed[2]),
      prefix: apiPrefix
    }
  }

  onSaveProvider = () => {
    this.props.cluster.preferences.prometheusProvider = this.provider ?
      { type: this.provider } :
      null;
  }

  onSavePath = () => {
    this.props.cluster.preferences.prometheus = this.parsePrometheusPath();
  };

  render() {
    return (
      <>
        <SubTitle title="Prometheus"/>
        <p>
          Use pre-installed Prometheus service for metrics. Please refer to the{" "}
          <a href="https://github.com/lensapp/lens/blob/master/troubleshooting/custom-prometheus.md" target="_blank">guide</a>{" "}
          for possible configuration changes.
        </p>
        <p>Prometheus installation method.</p>
        <Select
          value={this.provider}
          onChange={({value}) => {
            this.provider = value;
            this.onSaveProvider();
          }}
          options={options}
        />
        <small className="hint">What query format is used to fetch metrics from Prometheus</small>
        {this.canEditPrometheusPath && (
          <>
            <p>Prometheus service address.</p>
            <Input
              theme="round-black"
              value={this.path}
              onChange={(value) => this.path = value}
              onBlur={this.onSavePath}
              placeholder="<namespace>/<service>:<port>"
            />
            <small className="hint">
              An address to an existing Prometheus installation{" "}
              ({'<namespace>/<service>:<port>'}). Lens tries to auto-detect address if left empty.
            </small>
          </>
        )}
      </>
    );
  }
}