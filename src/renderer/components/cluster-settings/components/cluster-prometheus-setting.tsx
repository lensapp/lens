/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer, disposeOnUnmount } from "mobx-react";
import type { Cluster } from "../../../../common/cluster/cluster";
import { SubTitle } from "../../layout/sub-title";
import { Select } from "../../select";
import { Input } from "../../input";
import { observable, computed, autorun, makeObservable } from "mobx";
import { productName } from "../../../../common/vars";
import type { MetricProviderInfo } from "../../../../common/k8s-api/endpoints/metrics.api";
import { metricsApi } from "../../../../common/k8s-api/endpoints/metrics.api";
import { Spinner } from "../../spinner";
import type { GroupBase } from "react-select";

export interface ClusterPrometheusSettingProps {
  cluster: Cluster;
}

const autoDetectPrometheus = Symbol("auto-detect-prometheus");

type ProviderOption = typeof autoDetectPrometheus | string;

@observer
export class ClusterPrometheusSetting extends React.Component<ClusterPrometheusSettingProps> {
  @observable path = "";
  @observable provider: ProviderOption = autoDetectPrometheus;
  @observable loading = true;
  loadedOptions = observable.map<string, MetricProviderInfo>();

  @computed get options(): ProviderOption[] {
    return [
      autoDetectPrometheus,
      ...this.loadedOptions.keys(),
    ];
  }

  constructor(props: ClusterPrometheusSettingProps) {
    super(props);
    makeObservable(this);
  }

  @computed get canEditPrometheusPath(): boolean {
    if (this.provider === autoDetectPrometheus) {
      return false;
    }

    return this.loadedOptions.get(this.provider)?.isConfigurable ?? false;
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
      }),
    );

    metricsApi
      .getMetricProviders()
      .then(values => {
        this.loading = false;
        this.loadedOptions.replace(values.map(provider => [provider.id, provider]));
      });
  }

  parsePrometheusPath = () => {
    if (!this.provider || !this.path) {
      return undefined;
    }
    const parsed = this.path.split(/\/|:/, 3);
    const apiPrefix = this.path.substring(parsed.join("/").length);

    if (!parsed[0] || !parsed[1] || !parsed[2]) {
      return undefined;
    }

    return {
      namespace: parsed[0],
      service: parsed[1],
      port: parseInt(parsed[2]),
      prefix: apiPrefix,
    };
  };

  onSaveProvider = () => {
    this.props.cluster.preferences.prometheusProvider = typeof this.provider === "string"
      ? { type: this.provider }
      : undefined;
  };

  onSavePath = () => {
    this.props.cluster.preferences.prometheus = this.parsePrometheusPath();
  };

  render() {
    return (
      <>
        <section>
          <SubTitle title="Prometheus" />
          {
            this.loading
              ? <Spinner />
              : (
                <>
                  <Select<ProviderOption, false, GroupBase<ProviderOption>>
                    id="cluster-prometheus-settings-input"
                    value={this.provider}
                    onChange={provider => {
                      this.provider = provider ?? autoDetectPrometheus;
                      this.onSaveProvider();
                    }}
                    options={this.options}
                    themeName="lens"
                  />
                  <small className="hint">What query format is used to fetch metrics from Prometheus</small>
                </>
              )
          }
        </section>
        {this.canEditPrometheusPath && (
          <>
            <hr />
            <section>
              <SubTitle title="Prometheus service address" />
              <Input
                theme="round-black"
                value={this.path}
                onChange={(value) => this.path = value}
                onBlur={this.onSavePath}
                placeholder="<namespace>/<service>:<port>"
              />
              <small className="hint">
                {`An address to an existing Prometheus installation (<namespace>/<service>:<port>). ${productName} tries to auto-detect address if left empty.`}
              </small>
            </section>
          </>
        )}
      </>
    );
  }
}
