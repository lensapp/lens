import React from "react";
import { Component, Catalog, K8sApi } from "@k8slens/extensions";
import { observer } from "mobx-react";
import { computed, observable } from "mobx";
import { MetricsFeature, MetricsConfiguration } from "./metrics-feature";

interface Props {
  cluster: Catalog.KubernetesCluster;
}

@observer
export class MetricsSettings extends React.Component<Props> {
  @observable featureStates = {
    prometheus: false,
    kubeStateMetrics: false,
    nodeExporter: false
  };
  @observable canUpgrade = false;
  @observable upgrading = false;

  config: MetricsConfiguration = {
    prometheus: {
      enabled: false
    },
    persistence: {
      enabled: false,
      storageClass: null,
      size: "20G",
    },
    nodeExporter: {
      enabled: false,
    },
    retention: {
      time: "2d",
      size: "5GB",
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
    if (!this.props.cluster.status.active) return false;
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
    this.featureStates.prometheus = status.installed;

    const deployment = K8sApi.forCluster(this.props.cluster, K8sApi.Deployment);

    try {
      await deployment.get({name: "kube-state-metrics", namespace: "lens-metrics"});
      this.featureStates.kubeStateMetrics = true;
    } catch(e) {
      if (e?.error?.code === 404) {
        this.featureStates.kubeStateMetrics = false;
      } else {
        this.featureStates.kubeStateMetrics = undefined;
      }
    }

    const daemonSet = K8sApi.forCluster(this.props.cluster, K8sApi.DaemonSet);

    try {
      await daemonSet.get({name: "node-exporter", namespace: "lens-metrics"});
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

    if (!this.config.prometheus.enabled && !this.config.kubeStateMetrics.enabled && !this.config.nodeExporter.enabled) {
      await this.feature.uninstall(this.config);
    } else {
      await this.feature.install(this.config);
    }
  }

  async togglePrometheus(enabled: boolean) {
    this.featureStates.prometheus = enabled;

    try {
      await this.save();
    } catch(error) {
      this.featureStates.prometheus = !enabled;
      Component.Notifications.error(`Failed to ${enabled ? "enable" : "disable"} Prometheus: ${error}`);
    }
  }

  async toggleKubeStateMetrics(enabled: boolean) {
    this.featureStates.kubeStateMetrics = enabled;

    try {
      await this.save();
    } catch(error) {
      this.featureStates.kubeStateMetrics = !enabled;
      Component.Notifications.error(`Failed to ${enabled ? "enable" : "disable"} kube-state-metrics: ${error}`);
    }
  }

  async toggleNodeExporter(enabled: boolean) {
    this.featureStates.nodeExporter = enabled;

    try {
      await this.save();
    } catch(error) {
      this.featureStates.nodeExporter = !enabled;
      Component.Notifications.error(`Failed to ${enabled ? "enable" : "disable"} node-exporter: ${error}`);
    }
  }

  async updateStack() {
    this.upgrading = true;

    await this.save();
    setTimeout(() => {
      Component.Notifications.info("Lens Metrics stack updated!", {timeout: 5_000});
      this.upgrading = false;
      this.canUpgrade = false;
    }, 1000);
  }

  render() {
    return (
      <>
        { !this.props.cluster.status.active && (
          <section>
            <p style={ {color: "var(--colorError)"} }>
              Lens Metrics settings requires established connection to the cluster.
            </p>
          </section>
        )}
        { !this.isActiveMetricsProvider && (
          <section>
            <p style={ {color: "var(--colorError)"} }>
              Other metrics provider is currently active. See &quot;Metrics&quot; tab for details.
            </p>
          </section>
        )}
        { this.canUpgrade && (
          <section>
            <Component.SubTitle title="Software Update" />

            <Component.Button label={this.upgrading ? "Updating ..." : "Update Now"} primary onClick={() => this.updateStack() } waiting={this.upgrading} />

            <small className="hint">
              An update is available for enabled metrics components.
            </small>
          </section>
        )}
        <section>
          <Component.SubTitle title="Prometheus" />
          <Component.FormSwitch
            control={
              <Component.Switcher
                disabled={this.featureStates.kubeStateMetrics === undefined || !this.isTogglable}
                checked={!!this.featureStates.prometheus && this.props.cluster.status.active}
                onChange={v => this.togglePrometheus(v.target.checked)}
                name="prometheus"
              />
            }
            label="Install built-in Prometheus metrics stack"
          />
          <small className="hint">
            Enable timeseries data visualization (Prometheus stack) for your cluster.
          </small>
        </section>

        <section>
          <Component.SubTitle title="Kube State Metrics" />
          <Component.FormSwitch
            control={
              <Component.Switcher
                disabled={this.featureStates.kubeStateMetrics === undefined || !this.isTogglable}
                checked={!!this.featureStates.kubeStateMetrics && this.props.cluster.status.active}
                onChange={v => this.toggleKubeStateMetrics(v.target.checked)}
                name="node-exporter"
              />
            }
            label="Install built-in kube-state-metrics stack"
          />
          <small className="hint">
            Enable Kubernetes API object metrics for your cluster.
            Install this only if you don&apos;t have existing kube-state-metrics stack installed.
          </small>
        </section>

        <section>
          <Component.SubTitle title="Node Exporter" />
          <Component.FormSwitch
            control={
              <Component.Switcher
                disabled={this.featureStates.nodeExporter === undefined || !this.isTogglable}
                checked={!!this.featureStates.nodeExporter && this.props.cluster.status.active}
                onChange={v => this.toggleNodeExporter(v.target.checked)}
                name="node-exporter"
              />
            }
            label="Install built-in node-exporter stack"
          />
          <small className="hint">
            Enable node level metrics for your cluster.
            Install this only if you don&apos;t have existing node-exporter stack installed.
          </small>
        </section>
      </>
    );
  }
}
