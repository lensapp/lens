/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { PrometheusProvider } from "./provider";
import {
  bytesSent,
  createPrometheusProvider,
  findFirstNamespacedService,
  prometheusProviderInjectionToken,
} from "./provider";
import { getInjectable } from "@ogre-tools/injectable";

export const getStacklightLikeQueryFor =
  ({ rateAccuracy }: { rateAccuracy: string }): PrometheusProvider["getQuery"] =>
  (opts, queryName) => {
    switch (opts.category) {
      case "cluster":
        switch (queryName) {
          case "memoryUsage":
            return `sum(node_memory_MemTotal_bytes - (node_memory_MemFree_bytes + node_memory_Buffers_bytes + node_memory_Cached_bytes)) by (kubernetes_name)`.replace(
              /_bytes/g,
              `_bytes{node=~"${opts.nodes}"}`,
            );
          case "workloadMemoryUsage":
            return `sum(container_memory_working_set_bytes{container!="POD",container!="",instance=~"${opts.nodes}"}) by (component)`;
          case "memoryRequests":
            return `sum(kube_pod_container_resource_requests{node=~"${opts.nodes}", resource="memory"}) by (component)`;
          case "memoryLimits":
            return `sum(kube_pod_container_resource_limits{node=~"${opts.nodes}", resource="memory"}) by (component)`;
          case "memoryCapacity":
            return `sum(kube_node_status_capacity{node=~"${opts.nodes}", resource="memory"}) by (component)`;
          case "memoryAllocatableCapacity":
            return `sum(kube_node_status_allocatable{node=~"${opts.nodes}", resource="memory"}) by (component)`;
          case "cpuUsage":
            return `sum(rate(node_cpu_seconds_total{node=~"${opts.nodes}", mode=~"user|system"}[${rateAccuracy}]))`;
          case "cpuRequests":
            return `sum(kube_pod_container_resource_requests{node=~"${opts.nodes}", resource="cpu"}) by (component)`;
          case "cpuLimits":
            return `sum(kube_pod_container_resource_limits{node=~"${opts.nodes}", resource="cpu"}) by (component)`;
          case "cpuCapacity":
            return `sum(kube_node_status_capacity{node=~"${opts.nodes}", resource="cpu"}) by (component)`;
          case "cpuAllocatableCapacity":
            return `sum(kube_node_status_allocatable{node=~"${opts.nodes}", resource="cpu"}) by (component)`;
          case "podUsage":
            return `sum({__name__=~"kubelet_running_pod_count|kubelet_running_pods", instance=~"${opts.nodes}"})`;
          case "podCapacity":
            return `sum(kube_node_status_capacity{node=~"${opts.nodes}", resource="pods"}) by (component)`;
          case "podAllocatableCapacity":
            return `sum(kube_node_status_allocatable{node=~"${opts.nodes}", resource="pods"}) by (component)`;
          case "fsSize":
            return `sum(node_filesystem_size_bytes{node=~"${opts.nodes}", mountpoint="/"}) by (node)`;
          case "fsUsage":
            return `sum(node_filesystem_size_bytes{node=~"${opts.nodes}", mountpoint="/"} - node_filesystem_avail_bytes{node=~"${opts.nodes}", mountpoint="/"}) by (node)`;
        }
        break;
      case "nodes":
        switch (queryName) {
          case "memoryUsage":
            return `sum (node_memory_MemTotal_bytes - (node_memory_MemFree_bytes + node_memory_Buffers_bytes + node_memory_Cached_bytes)) by (node)`;
          case "workloadMemoryUsage":
            return `sum(container_memory_working_set_bytes{container!="POD",container!=""}) by (instance)`;
          case "memoryCapacity":
            return `sum(kube_node_status_capacity{resource="memory"}) by (node)`;
          case "memoryAllocatableCapacity":
            return `sum(kube_node_status_allocatable{resource="memory"}) by (node)`;
          case "cpuUsage":
            return `sum(rate(node_cpu_seconds_total{mode=~"user|system"}[${rateAccuracy}])) by(node)`;
          case "cpuCapacity":
            return `sum(kube_node_status_allocatable{resource="cpu"}) by (node)`;
          case "cpuAllocatableCapacity":
            return `sum(kube_node_status_allocatable{resource="cpu"}) by (node)`;
          case "fsSize":
            return `sum(node_filesystem_size_bytes{mountpoint="/"}) by (node)`;
          case "fsUsage":
            return `sum(node_filesystem_size_bytes{mountpoint="/"} - node_filesystem_avail_bytes{mountpoint="/"}) by (node)`;
        }
        break;
      case "pods":
        switch (queryName) {
          case "cpuUsage":
            return `sum(rate(container_cpu_usage_seconds_total{container!="POD",container!="",pod=~"${opts.pods}",namespace="${opts.namespace}"}[${rateAccuracy}])) by (${opts.selector})`;
          case "cpuRequests":
            return `sum(kube_pod_container_resource_requests{pod=~"${opts.pods}",resource="cpu",namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "cpuLimits":
            return `sum(kube_pod_container_resource_limits{pod=~"${opts.pods}",resource="cpu",namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "memoryUsage":
            return `sum(container_memory_working_set_bytes{container!="POD",container!="",pod=~"${opts.pods}",namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "memoryRequests":
            return `sum(kube_pod_container_resource_requests{pod=~"${opts.pods}",resource="memory",namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "memoryLimits":
            return `sum(kube_pod_container_resource_limits{pod=~"${opts.pods}",resource="memory",namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "fsUsage":
            return `sum(container_fs_usage_bytes{container!="POD",container!="",pod=~"${opts.pods}",namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "fsWrites":
            return `sum(rate(container_fs_writes_bytes_total{container!="", pod=~"${opts.pods}", namespace="${opts.namespace}"}[${rateAccuracy}])) by (${opts.selector})`;
          case "fsReads":
            return `sum(rate(container_fs_reads_bytes_total{container!="", pod=~"${opts.pods}", namespace="${opts.namespace}"}[${rateAccuracy}])) by (${opts.selector})`;
          case "networkReceive":
            return `sum(rate(container_network_receive_bytes_total{pod=~"${opts.pods}",namespace="${opts.namespace}"}[${rateAccuracy}])) by (${opts.selector})`;
          case "networkTransmit":
            return `sum(rate(container_network_transmit_bytes_total{pod=~"${opts.pods}",namespace="${opts.namespace}"}[${rateAccuracy}])) by (${opts.selector})`;
        }
        break;
      case "pvc":
        switch (queryName) {
          case "diskUsage":
            return `sum(kubelet_volume_stats_used_bytes{persistentvolumeclaim="${opts.pvc}",namespace="${opts.namespace}"}) by (persistentvolumeclaim, namespace)`;
          case "diskCapacity":
            return `sum(kubelet_volume_stats_capacity_bytes{persistentvolumeclaim="${opts.pvc}",namespace="${opts.namespace}"}) by (persistentvolumeclaim, namespace)`;
        }
        break;
      case "ingress":
        switch (queryName) {
          case "bytesSentSuccess":
            return bytesSent({
              rateAccuracy,
              ingress: opts.ingress,
              namespace: opts.namespace,
              statuses: "^2\\\\d*",
            });
          case "bytesSentFailure":
            return bytesSent({
              rateAccuracy,
              ingress: opts.ingress,
              namespace: opts.namespace,
              statuses: "^5\\\\d*",
            });
          case "requestDurationSeconds":
            return `sum(rate(nginx_ingress_controller_request_duration_seconds_sum{ingress="${opts.ingress}",namespace="${opts.namespace}"}[${rateAccuracy}])) by (ingress, namespace)`;
          case "responseDurationSeconds":
            return `sum(rate(nginx_ingress_controller_response_duration_seconds_sum{ingress="${opts.ingress}",namespace="${opts.namespace}"}[${rateAccuracy}])) by (ingress, namespace)`;
        }
        break;
    }

    throw new Error(`Unknown queryName="${queryName}" for category="${opts.category}"`);
  };

const stacklightPrometheusProviderInjectable = getInjectable({
  id: "stacklight-prometheus-provider",
  instantiate: () =>
    createPrometheusProvider({
      kind: "stacklight",
      name: "Stacklight",
      isConfigurable: true,
      getService: (client) => findFirstNamespacedService(client, "prometheus-server", "stacklight"),
      getQuery: getStacklightLikeQueryFor({ rateAccuracy: "1m" }),
    }),
  injectionToken: prometheusProviderInjectionToken,
});

export default stacklightPrometheusProviderInjectable;
