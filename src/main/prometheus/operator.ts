import { PrometheusProvider, PrometheusQueryOpts, PrometheusQuery, PrometheusService } from "./provider-registry";
import { CoreV1Api } from "@kubernetes/client-node";
import logger from "../logger";

export class PrometheusOperator extends PrometheusProvider {
  rateAccuracy = "1m";
  id = "operator";
  name = "Prometheus Operator";

  public async getPrometheusService(client: CoreV1Api): Promise<PrometheusService | undefined> {
    try {
      let serviceItem;

      for (const labelSelector of ["operated-prometheus=true", "self-monitor=true"]) {
        serviceItem ??= (
          await client.listServiceForAllNamespaces(undefined, undefined, undefined, labelSelector)
        )?.body.items[0];
      }

      const { metadata, spec } = serviceItem ?? {};
      const { namespace, name: service } = metadata ?? {};
      const { ports: [{ port }] = [] } = spec ?? {};

      if (port && namespace && service) {
        return {
          id: this.id,
          namespace,
          service,
          port,
        };
      }
    } catch(error) {
      logger.warn(`PrometheusOperator: failed to list services: ${error.toString()}`);
    }
  }

  public getQueries(opts: PrometheusQueryOpts): PrometheusQuery | undefined {
    switch(opts.category) {
      case "cluster":
        return {
          memoryUsage: `
          sum(
            node_memory_MemTotal_bytes - (node_memory_MemFree_bytes + node_memory_Buffers_bytes + node_memory_Cached_bytes)
          )
        `.replace(/_bytes/g, `_bytes * on (pod,namespace) group_left(node) kube_pod_info{node=~"${opts.nodes}"}`),
          memoryRequests: `sum(kube_pod_container_resource_requests{node=~"${opts.nodes}", resource="memory"})`,
          memoryLimits: `sum(kube_pod_container_resource_limits{node=~"${opts.nodes}", resource="memory"})`,
          memoryCapacity: `sum(kube_node_status_capacity{node=~"${opts.nodes}", resource="memory"})`,
          cpuUsage: `sum(rate(node_cpu_seconds_total{mode=~"user|system"}[${this.rateAccuracy}])* on (pod,namespace) group_left(node) kube_pod_info{node=~"${opts.nodes}"})`,
          cpuRequests:`sum(kube_pod_container_resource_requests{node=~"${opts.nodes}", resource="cpu"})`,
          cpuLimits: `sum(kube_pod_container_resource_limits{node=~"${opts.nodes}", resource="cpu"})`,
          cpuCapacity: `sum(kube_node_status_capacity{node=~"${opts.nodes}", resource="cpu"})`,
          podUsage: `sum({__name__=~"kubelet_running_pod_count|kubelet_running_pods", node=~"${opts.nodes}"})`,
          podCapacity: `sum(kube_node_status_capacity{node=~"${opts.nodes}", resource="pods"})`,
          fsSize: `sum(node_filesystem_size_bytes{mountpoint="/"} * on (pod,namespace) group_left(node) kube_pod_info{node=~"${opts.nodes}"})`,
          fsUsage: `sum(node_filesystem_size_bytes{mountpoint="/"} * on (pod,namespace) group_left(node) kube_pod_info{node=~"${opts.nodes}"} - node_filesystem_avail_bytes{mountpoint="/"} * on (pod,namespace) group_left(node) kube_pod_info{node=~"${opts.nodes}"})`
        };
      case "nodes":
        return {
          memoryUsage: `sum((node_memory_MemTotal_bytes - (node_memory_MemFree_bytes + node_memory_Buffers_bytes + node_memory_Cached_bytes)) * on (pod,namespace) group_left(node) kube_pod_info) by (node)`,
          memoryCapacity: `sum(kube_node_status_capacity{resource="memory"}) by (node)`,
          cpuUsage: `sum(rate(node_cpu_seconds_total{mode=~"user|system"}[${this.rateAccuracy}]) * on (pod,namespace) group_left(node) kube_pod_info) by (node)`,
          cpuCapacity: `sum(kube_node_status_allocatable{resource="cpu"}) by (node)`,
          fsSize: `sum(node_filesystem_size_bytes{mountpoint="/"} * on (pod,namespace) group_left(node) kube_pod_info) by (node)`,
          fsUsage: `sum((node_filesystem_size_bytes{mountpoint="/"} - node_filesystem_avail_bytes{mountpoint="/"}) * on (pod,namespace) group_left(node) kube_pod_info) by (node)`
        };
      case "pods":
        return {
          cpuUsage: `sum(rate(container_cpu_usage_seconds_total{container!="POD",container!="",image!="",pod=~"${opts.pods}",namespace="${opts.namespace}"}[${this.rateAccuracy}])) by (${opts.selector})`,
          cpuRequests: `sum(kube_pod_container_resource_requests{pod=~"${opts.pods}",resource="cpu",namespace="${opts.namespace}"}) by (${opts.selector})`,
          cpuLimits: `sum(kube_pod_container_resource_limits{pod=~"${opts.pods}",resource="cpu",namespace="${opts.namespace}"}) by (${opts.selector})`,
          memoryUsage: `sum(container_memory_working_set_bytes{container!="POD",container!="",image!="",pod=~"${opts.pods}",namespace="${opts.namespace}"}) by (${opts.selector})`,
          memoryRequests: `sum(kube_pod_container_resource_requests{pod=~"${opts.pods}",resource="memory",namespace="${opts.namespace}"}) by (${opts.selector})`,
          memoryLimits: `sum(kube_pod_container_resource_limits{pod=~"${opts.pods}",resource="memory",namespace="${opts.namespace}"}) by (${opts.selector})`,
          fsUsage: `sum(container_fs_usage_bytes{container!="POD",container!="",pod=~"${opts.pods}",namespace="${opts.namespace}"}) by (${opts.selector})`,
          networkReceive: `sum(rate(container_network_receive_bytes_total{pod=~"${opts.pods}",namespace="${opts.namespace}"}[${this.rateAccuracy}])) by (${opts.selector})`,
          networkTransmit: `sum(rate(container_network_transmit_bytes_total{pod=~"${opts.pods}",namespace="${opts.namespace}"}[${this.rateAccuracy}])) by (${opts.selector})`
        };
      case "pvc":
        return {
          diskUsage: `sum(kubelet_volume_stats_used_bytes{persistentvolumeclaim="${opts.pvc}"}) by (persistentvolumeclaim, namespace)`,
          diskCapacity: `sum(kubelet_volume_stats_capacity_bytes{persistentvolumeclaim="${opts.pvc}"}) by (persistentvolumeclaim, namespace)`
        };
      case "ingress":
        const bytesSent = (ingress: string, statuses: string) =>
          `sum(rate(nginx_ingress_controller_bytes_sent_sum{ingress="${ingress}", status=~"${statuses}"}[${this.rateAccuracy}])) by (ingress)`;

        return {
          bytesSentSuccess: bytesSent(opts.ingress, "^2\\\\d*"),
          bytesSentFailure: bytesSent(opts.ingress, "^5\\\\d*"),
          requestDurationSeconds: `sum(rate(nginx_ingress_controller_request_duration_seconds_sum{ingress="${opts.ingress}"}[${this.rateAccuracy}])) by (ingress)`,
          responseDurationSeconds: `sum(rate(nginx_ingress_controller_response_duration_seconds_sum{ingress="${opts.ingress}"}[${this.rateAccuracy}])) by (ingress)`
        };
    }
  }
}
