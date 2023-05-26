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

export const getOperatorLikeQueryFor =
  ({ rateAccuracy }: { rateAccuracy: string }): PrometheusProvider["getQuery"] =>
  (opts, queryName) => {
    switch (opts.category) {
      case "cluster":
        switch (queryName) {
          case "memoryUsage":
            return `sum(node_memory_MemTotal_bytes - (node_memory_MemFree_bytes + node_memory_Buffers_bytes + node_memory_Cached_bytes))`.replace(
              /_bytes/g,
              `_bytes * on (pod,namespace) group_left(node) kube_pod_info{node=~"${opts.nodes}"}`,
            );
          case "workloadMemoryUsage":
            return `sum(container_memory_working_set_bytes{container!="", instance=~"${opts.nodes}"}) by (component)`;
          case "memoryRequests":
            return `sum(kube_pod_container_resource_requests{node=~"${opts.nodes}", resource="memory"})`;
          case "memoryLimits":
            return `sum(kube_pod_container_resource_limits{node=~"${opts.nodes}", resource="memory"})`;
          case "memoryCapacity":
            return `sum(kube_node_status_capacity{node=~"${opts.nodes}", resource="memory"})`;
          case "memoryAllocatableCapacity":
            return `sum(kube_node_status_allocatable{node=~"${opts.nodes}", resource="memory"})`;
          case "cpuUsage":
            return `sum(rate(node_cpu_seconds_total{mode=~"user|system"}[${rateAccuracy}])* on (pod,namespace) group_left(node) kube_pod_info{node=~"${opts.nodes}"})`;
          case "cpuRequests":
            return `sum(kube_pod_container_resource_requests{node=~"${opts.nodes}", resource="cpu"})`;
          case "cpuLimits":
            return `sum(kube_pod_container_resource_limits{node=~"${opts.nodes}", resource="cpu"})`;
          case "cpuCapacity":
            return `sum(kube_node_status_capacity{node=~"${opts.nodes}", resource="cpu"})`;
          case "cpuAllocatableCapacity":
            return `sum(kube_node_status_allocatable{node=~"${opts.nodes}", resource="cpu"})`;
          case "podUsage":
            return `sum({__name__=~"kubelet_running_pod_count|kubelet_running_pods", node=~"${opts.nodes}"})`;
          case "podCapacity":
            return `sum(kube_node_status_capacity{node=~"${opts.nodes}", resource="pods"})`;
          case "podAllocatableCapacity":
            return `sum(kube_node_status_allocatable{node=~"${opts.nodes}", resource="pods"})`;
          case "fsSize":
            return `sum(node_filesystem_size_bytes{mountpoint="/"} * on (pod,namespace) group_left(node) kube_pod_info{node=~"${opts.nodes}"})`;
          case "fsUsage":
            return `sum(node_filesystem_size_bytes{mountpoint="/"} * on (pod,namespace) group_left(node) kube_pod_info{node=~"${opts.nodes}"} - node_filesystem_avail_bytes{mountpoint="/"} * on (pod,namespace) group_left(node) kube_pod_info{node=~"${opts.nodes}"})`;
        }
        break;
      case "nodes":
        switch (queryName) {
          case "memoryUsage":
            return `sum((node_memory_MemTotal_bytes - (node_memory_MemFree_bytes + node_memory_Buffers_bytes + node_memory_Cached_bytes)) * on (pod, namespace) group_left(node) kube_pod_info) by (node)`;
          case "workloadMemoryUsage":
            return `sum(container_memory_working_set_bytes{container!="POD", container!=""}) by (node)`;
          case "memoryCapacity":
            return `sum(kube_node_status_capacity{resource="memory"}) by (node)`;
          case "memoryAllocatableCapacity":
            return `sum(kube_node_status_allocatable{resource="memory"}) by (node)`;
          case "cpuUsage":
            return `sum(rate(node_cpu_seconds_total{mode=~"user|system"}[${rateAccuracy}]) * on (pod, namespace) group_left(node) kube_pod_info) by (node)`;
          case "cpuCapacity":
            return `sum(kube_node_status_allocatable{resource="cpu"}) by (node)`;
          case "cpuAllocatableCapacity":
            return `sum(kube_node_status_allocatable{resource="cpu"}) by (node)`;
          case "fsSize":
            return `sum(node_filesystem_size_bytes{mountpoint="/"} * on (pod,namespace) group_left(node) kube_pod_info) by (node)`;
          case "fsUsage":
            return `sum((node_filesystem_size_bytes{mountpoint="/"} - node_filesystem_avail_bytes{mountpoint="/"}) * on (pod, namespace) group_left(node) kube_pod_info) by (node)`;
        }
        break;
      case "pods":
        switch (queryName) {
          case "cpuUsage":
            return `sum(rate(container_cpu_usage_seconds_total{pod=~"${opts.pods}", namespace="${opts.namespace}"}[${rateAccuracy}])) by (${opts.selector})`;
          case "cpuRequests":
            return `sum(kube_pod_container_resource_requests{pod=~"${opts.pods}", resource="cpu", namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "cpuLimits":
            return `sum(kube_pod_container_resource_limits{pod=~"${opts.pods}", resource="cpu", namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "memoryUsage":
            return `sum(container_memory_working_set_bytes{pod=~"${opts.pods}", namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "memoryRequests":
            return `sum(kube_pod_container_resource_requests{pod=~"${opts.pods}", resource="memory", namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "memoryLimits":
            return `sum(kube_pod_container_resource_limits{pod=~"${opts.pods}", resource="memory", namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "fsUsage":
            return `sum(container_fs_usage_bytes{pod=~"${opts.pods}", namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "fsWrites":
            return `sum(rate(container_fs_writes_bytes_total{pod=~"${opts.pods}", namespace="${opts.namespace}"}[${rateAccuracy}])) by (${opts.selector})`;
          case "fsReads":
            return `sum(rate(container_fs_reads_bytes_total{pod=~"${opts.pods}", namespace="${opts.namespace}"}[${rateAccuracy}])) by (${opts.selector})`;
          case "networkReceive":
            return `sum(rate(container_network_receive_bytes_total{pod=~"${opts.pods}", namespace="${opts.namespace}"}[${rateAccuracy}])) by (${opts.selector})`;
          case "networkTransmit":
            return `sum(rate(container_network_transmit_bytes_total{pod=~"${opts.pods}", namespace="${opts.namespace}"}[${rateAccuracy}])) by (${opts.selector})`;
        }
        break;
      case "pvc":
        switch (queryName) {
          case "diskUsage":
            return `sum(kubelet_volume_stats_used_bytes{persistentvolumeclaim="${opts.pvc}", namespace="${opts.namespace}"}) by (persistentvolumeclaim, namespace)`;
          case "diskCapacity":
            return `sum(kubelet_volume_stats_capacity_bytes{persistentvolumeclaim="${opts.pvc}", namespace="${opts.namespace}"}) by (persistentvolumeclaim, namespace)`;
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
            return `sum(rate(nginx_ingress_controller_request_duration_seconds_sum{ingress="${opts.ingress}", namespace="${opts.namespace}"}[${rateAccuracy}])) by (ingress, namespace)`;
          case "responseDurationSeconds":
            return `sum(rate(nginx_ingress_controller_response_duration_seconds_sum{ingress="${opts.ingress}", namespace="${opts.namespace}"}[${rateAccuracy}])) by (ingress, namespace)`;
        }
        break;
    }

    throw new Error(`Unknown queryName="${queryName}" for category="${opts.category}"`);
  };

const operatorPrometheusProviderInjectable = getInjectable({
  id: "operator-prometheus-provider",
  instantiate: () =>
    createPrometheusProvider({
      kind: "operator",
      name: "Prometheus Operator",
      isConfigurable: true,
      getService: (client) => findFirstNamespacedService(client, "operated-prometheus=true"),
      getQuery: getOperatorLikeQueryFor({ rateAccuracy: "1m" }),
    }),
  injectionToken: prometheusProviderInjectionToken,
});

export default operatorPrometheusProviderInjectable;
