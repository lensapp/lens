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
import { Common, Renderer } from "@k8slens/extensions";
import { observer } from "mobx-react";
import { computed, observable, makeObservable } from "mobx";
import { MetricsFeature, MetricsConfiguration } from "./metrics-feature";

const {
  K8sApi: {
    forCluster, StatefulSet, DaemonSet, Deployment,
  },
  Component: {
    SubTitle, FormSwitch, Switcher, Button,
  },
} = Renderer;

interface Props {
  cluster: Common.Catalog.KubernetesCluster;
}

@observer
export class MetricsSettings extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  @observable featureStates = {
    prometheus: false,
    kubeStateMetrics: false,
    nodeExporter: false,
  };
  @observable canUpgrade = false;
  @observable upgrading = false;
  @observable changed = false;
  @observable inProgress = false;

  config: MetricsConfiguration = {
    prometheus: {
      enabled: false,
    },
    persistence: {
      enabled: false,
      storageClass: null,
      size: "20Gi", // kubernetes yaml value (no B suffix)
    },
    nodeExporter: {
      enabled: false,
    },
    retention: {
      time: "2d",
      size: "5GiB", // argument for prometheus (requires B suffix)
    },
    kubeStateMetrics: {
      enabled: false,
    },
    alertManagers: null,
    replicas: 1,
    storageClass: null,
  };
  feature: MetricsFeature;

  @computed get isTogglable() {
    if (this.inProgress) return false;
    if (this.props.cluster.status.phase !== "connected") return false;
    if (this.canUpgrade) return false;
    if (!this.isActiveMetricsProvider) return false;

    return true;
  }

  get metricsProvider() {
    return this.props.cluster.spec?.metrics?.prometheus?.type || "";
  }

  get isActiveMetricsProvider() {
    return (!this.metricsProvider || this.metricsProvider === "lens");
  }

  async componentDidMount() {
    this.feature = new MetricsFeature(this.props.cluster);

    await this.updateFeatureStates();
  }

  async updateFeatureStates() {
    const status = await this.feature.getStatus();

    this.canUpgrade = status.canUpgrade;

    if (this.canUpgrade) {
      this.changed = true;
    }

    const statefulSet = forCluster(this.props.cluster, StatefulSet);

    try {
      await statefulSet.get({ name: "prometheus", namespace: "lens-metrics" });
      this.featureStates.prometheus = true;
    } catch(e) {
      if (e?.error?.code === 404) {
        this.featureStates.prometheus = false;
      } else {
        this.featureStates.prometheus = undefined;
      }
    }

    const deployment = forCluster(this.props.cluster, Deployment);

    try {
      await deployment.get({ name: "kube-state-metrics", namespace: "lens-metrics" });
      this.featureStates.kubeStateMetrics = true;
    } catch(e) {
      if (e?.error?.code === 404) {
        this.featureStates.kubeStateMetrics = false;
      } else {
        this.featureStates.kubeStateMetrics = undefined;
      }
    }

    const daemonSet = forCluster(this.props.cluster, DaemonSet);

    try {
      await daemonSet.get({ name: "node-exporter", namespace: "lens-metrics" });
      this.featureStates.nodeExporter = true;
    } catch(e) {
      if (e?.error?.code === 404) {
        this.featureStates.nodeExporter = false;
      } else {
        this.featureStates.nodeExporter = undefined;
      }
    }
  }

  async save() {
    this.config.prometheus.enabled = !!this.featureStates.prometheus;
    this.config.kubeStateMetrics.enabled = !!this.featureStates.kubeStateMetrics;
    this.config.nodeExporter.enabled = !!this.featureStates.nodeExporter;

    this.inProgress = true;

    try {
      if (!this.config.prometheus.enabled && !this.config.kubeStateMetrics.enabled && !this.config.nodeExporter.enabled) {
        await this.feature.uninstall(this.config);
      } else {
        await this.feature.install(this.config);
      }
    } finally {
      this.inProgress = false;
      this.changed = false;

      await this.updateFeatureStates();
    }
  }

  async togglePrometheus(enabled: boolean) {
    this.featureStates.prometheus = enabled;
    this.changed = true;
  }

  async toggleKubeStateMetrics(enabled: boolean) {
    this.featureStates.kubeStateMetrics = enabled;
    this.changed = true;
  }

  async toggleNodeExporter(enabled: boolean) {
    this.featureStates.nodeExporter = enabled;
    this.changed = true;
  }

  @computed get buttonLabel() {
    const allDisabled = !this.featureStates.kubeStateMetrics && !this.featureStates.nodeExporter && !this.featureStates.prometheus;

    if (this.inProgress && this.canUpgrade) return "Upgrading ...";
    if (this.inProgress && allDisabled) return "Uninstalling ...";
    if (this.inProgress) return "Applying ...";
    if (this.canUpgrade) return "Upgrade";

    if (this.changed && allDisabled) {
      return "Uninstall";
    }

    return "Apply";
  }

  render() {
    return (
      <>
        { this.props.cluster.status.phase !== "connected" && (
          <section>
            <p style={ { color: "var(--colorError)" } }>
              Lens Metrics settings requires established connection to the cluster.
            </p>
          </section>
        )}
        { !this.isActiveMetricsProvider && (
          <section>
            <p style={ { color: "var(--colorError)" } }>
              Other metrics provider is currently active. See &quot;Metrics&quot; tab for details.
            </p>
          </section>
        )}
        <section>
          <SubTitle title="Prometheus" />
          <FormSwitch
            control={
              <Switcher
                disabled={this.featureStates.kubeStateMetrics === undefined || !this.isTogglable}
                checked={!!this.featureStates.prometheus && this.props.cluster.status.phase == "connected"}
                onChange={v => this.togglePrometheus(v.target.checked)}
                name="prometheus"
              />
            }
            label="Enable bundled Prometheus metrics stack"
          />
          <small className="hint">
            Enable timeseries data visualization (Prometheus stack) for your cluster.
          </small>
        </section>

        <section>
          <SubTitle title="Kube State Metrics" />
          <FormSwitch
            control={
              <Switcher
                disabled={this.featureStates.kubeStateMetrics === undefined || !this.isTogglable}
                checked={!!this.featureStates.kubeStateMetrics && this.props.cluster.status.phase == "connected"}
                onChange={v => this.toggleKubeStateMetrics(v.target.checked)}
                name="node-exporter"
              />
            }
            label="Enable bundled kube-state-metrics stack"
          />
          <small className="hint">
            Enable Kubernetes API object metrics for your cluster.
            Enable this only if you don&apos;t have existing kube-state-metrics stack installed.
          </small>
        </section>

        <section>
          <SubTitle title="Node Exporter" />
          <FormSwitch
            control={
              <Switcher
                disabled={this.featureStates.nodeExporter === undefined || !this.isTogglable}
                checked={!!this.featureStates.nodeExporter && this.props.cluster.status.phase == "connected"}
                onChange={v => this.toggleNodeExporter(v.target.checked)}
                name="node-exporter"
              />
            }
            label="Enable bundled node-exporter stack"
          />
          <small className="hint">
            Enable node level metrics for your cluster.
            Enable this only if you don&apos;t have existing node-exporter stack installed.
          </small>
        </section>

        <section>
          <Button
            label={this.buttonLabel}
            waiting={this.inProgress}
            onClick={() => this.save()}
            primary
            disabled={!this.changed}
            className="w-60 h-14"
          />

          {this.canUpgrade && (<small className="hint">
            An update is available for enabled metrics components.
          </small>)}
        </section>
      </>
    );
  }
}
