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
import { observer, disposeOnUnmount } from "mobx-react";
import type { Cluster } from "../../../../main/cluster";
import { SubTitle } from "../../layout/sub-title";
import { Select, SelectOption } from "../../select";
import { Input } from "../../input";
import { observable, computed, autorun, makeObservable } from "mobx";
import { productName } from "../../../../common/vars";
import { MetricProviderInfo, metricsApi } from "../../../../common/k8s-api/endpoints/metrics.api";
import { Spinner } from "../../spinner";

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterPrometheusSetting extends React.Component<Props> {
  @observable path = "";
  @observable provider = "";
  @observable loading = true;
  @observable loadedOptions: MetricProviderInfo[] = [];

  @computed get options(): SelectOption<string>[] {
    return [
      { value: "", label: "Auto detect" },
      ...this.loadedOptions.map(({ name, id }) => ({ value: id, label: name })),
    ];
  }

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  @computed get canEditPrometheusPath(): boolean {
    return Boolean(
      this.loadedOptions
        .find(opt => opt.id === this.provider)
        ?.isConfigurable,
    );
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

        if (values) {
          this.loadedOptions = values;
        }
      });
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
      prefix: apiPrefix,
    };
  };

  onSaveProvider = () => {
    this.props.cluster.preferences.prometheusProvider = this.provider ?
      { type: this.provider } :
      null;
  };

  onSavePath = () => {
    this.props.cluster.preferences.prometheus = this.parsePrometheusPath();
  };

  render() {
    return (
      <>
        <section>
          <SubTitle title="Prometheus"/>
          {
            this.loading
              ? <Spinner />
              : <>
                <Select
                  value={this.provider}
                  onChange={({ value }) => {
                    this.provider = value;
                    this.onSaveProvider();
                  }}
                  options={this.options}
                  themeName="lens"
                />
                <small className="hint">What query format is used to fetch metrics from Prometheus</small>
              </>
          }
        </section>
        {this.canEditPrometheusPath && (
          <>
            <hr/>
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
                An address to an existing Prometheus installation{" "}
                ({"<namespace>/<service>:<port>"}). {productName} tries to auto-detect address if left empty.
              </small>
            </section>
          </>
        )}
      </>
    );
  }
}
