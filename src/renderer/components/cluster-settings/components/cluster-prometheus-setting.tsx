/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer, disposeOnUnmount } from "mobx-react";
import type { Cluster } from "../../../../common/cluster/cluster";
import { SubTitle } from "../../layout/sub-title";
import type { SelectOption } from "../../select";
import { Select } from "../../select";
import { Input } from "../../input";
import { observable, computed, autorun, makeObservable } from "mobx";
import { productName } from "../../../../common/vars";
import type { MetricProviderInfo } from "../../../../common/k8s-api/endpoints/metrics.api";
import { metricsApi } from "../../../../common/k8s-api/endpoints/metrics.api";
import { Spinner } from "../../spinner";

export interface ClusterPrometheusSettingProps {
  cluster: Cluster;
}

const autoDetectPrometheus = Symbol("auto-detect-prometheus");

type ProviderValue = typeof autoDetectPrometheus | string;

@observer
export class ClusterPrometheusSetting extends React.Component<ClusterPrometheusSettingProps> {
  @observable path = "";
  @observable selectedOption: ProviderValue = autoDetectPrometheus;
  @observable loading = true;
  readonly loadedOptions = observable.map<string, MetricProviderInfo>();

  @computed get options(): SelectOption<ProviderValue>[] {
    return [
      {
        value: autoDetectPrometheus,
        label: "Auto Detect Prometheus",
        isSelected: autoDetectPrometheus === this.selectedOption,
      },
      ...Array.from(this.loadedOptions, ([id, provider]) => ({
        value: id,
        label: provider.name,
        isSelected: id === this.selectedOption,
      })),
    ];
  }

  constructor(props: ClusterPrometheusSettingProps) {
    super(props);
    makeObservable(this);
  }

  @computed get canEditPrometheusPath(): boolean {
    if (!this.selectedOption || this.selectedOption === autoDetectPrometheus) {
      return false;
    }

    return this.loadedOptions.get(this.selectedOption)?.isConfigurable ?? false;
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
          this.selectedOption = this.options.find(opt => opt.value === prometheusProvider.type)?.value ?? autoDetectPrometheus;
        } else {
          this.selectedOption = autoDetectPrometheus;
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
    if (!this.selectedOption || !this.path) {
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
    this.props.cluster.preferences.prometheusProvider = typeof this.selectedOption === "string"
      ? { type: this.selectedOption }
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
                  <Select
                    id="cluster-prometheus-settings-input"
                    value={this.selectedOption}
                    onChange={option => {
                      this.selectedOption = option?.value ?? autoDetectPrometheus;
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
