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

import { PrometheusProvider, PrometheusService } from "./provider-registry";
import type { CoreV1Api } from "@kubernetes/client-node";
import { inspect } from "util";

export class PrometheusOperator extends PrometheusProvider {
  readonly rateAccuracy: string = "1m";
  readonly id: string = "operator";
  readonly name: string = "Prometheus Operator";
  readonly isConfigurable: boolean = true;

  public async getPrometheusService(client: CoreV1Api): Promise<PrometheusService | undefined> {
    return this.getFirstNamespacedServer(client, "operated-prometheus=true", "self-monitor=true");
  }

  public getQuery(opts: Record<string, string>, queryName: string): string {
    switch(opts.category) {
      case "cluster":
        switch (queryName) {
          case "memoryUsage":
            return `sum(node_memory_MemTotal_bytes - (node_memory_MemFree_bytes + node_memory_Buffers_bytes + node_memory_Cached_bytes))`.replace(/_bytes/g, `_bytes * on (pod,namespace) group_left(node) kube_pod_info{node=~"${opts.nodes}"}`);
          case "workloadMemoryUsage":
            return `sum(container_memory_working_set_bytes{container!="POD",container!="",instance=~"${opts.nodes}"}) by (component)`;
          case "memoryRequests":
            return `sum(kube_pod_container_resource_requests{node=~"${opts.nodes}", resource="memory"})`;
          case "memoryLimits":
            return `sum(kube_pod_container_resource_limits{node=~"${opts.nodes}", resource="memory"})`;
          case "memoryCapacity":
            return `sum(kube_node_status_capacity{node=~"${opts.nodes}", resource="memory"})`;
          case "memoryAllocatableCapacity":
            return `sum(kube_node_status_allocatable{node=~"${opts.nodes}", resource="memory"})`;
          case "cpuUsage":
            return `sum(rate(node_cpu_seconds_total{mode=~"user|system"}[${this.rateAccuracy}])* on (pod,namespace) group_left(node) kube_pod_info{node=~"${opts.nodes}"})`;
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
            return `sum((node_memory_MemTotal_bytes - (node_memory_MemFree_bytes + node_memory_Buffers_bytes + node_memory_Cached_bytes)) * on (pod,namespace) group_left(node) kube_pod_info) by (node)`;
          case "workloadMemoryUsage":
            return `sum(container_memory_working_set_bytes{container!="POD",container!=""}) by (node)`;
          case "memoryCapacity":
            return `sum(kube_node_status_capacity{resource="memory"}) by (node)`;
          case "memoryAllocatableCapacity":
            return `sum(kube_node_status_allocatable{resource="memory"}) by (node)`;
          case "cpuUsage":
            return `sum(rate(node_cpu_seconds_total{mode=~"user|system"}[${this.rateAccuracy}]) * on (pod,namespace) group_left(node) kube_pod_info) by (node)`;
          case "cpuCapacity":
            return `sum(kube_node_status_allocatable{resource="cpu"}) by (node)`;
          case "cpuAllocatableCapacity":
            return `sum(kube_node_status_allocatable{resource="cpu"}) by (node)`;
          case "fsSize":
            return `sum(node_filesystem_size_bytes{mountpoint="/"} * on (pod,namespace) group_left(node) kube_pod_info) by (node)`;
          case "fsUsage":
            return `sum((node_filesystem_size_bytes{mountpoint="/"} - node_filesystem_avail_bytes{mountpoint="/"}) * on (pod,namespace) group_left(node) kube_pod_info) by (node)`;
        }
        break;
      case "pods":
        switch (queryName) {
          case "cpuUsage":
            return `sum(rate(container_cpu_usage_seconds_total{container!="POD",container!="",image!="",pod=~"${opts.pods}",namespace="${opts.namespace}"}[${this.rateAccuracy}])) by (${opts.selector})`;
          case "cpuRequests":
            return `sum(kube_pod_container_resource_requests{pod=~"${opts.pods}",resource="cpu",namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "cpuLimits":
            return `sum(kube_pod_container_resource_limits{pod=~"${opts.pods}",resource="cpu",namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "memoryUsage":
            return `sum(container_memory_working_set_bytes{container!="POD",container!="",image!="",pod=~"${opts.pods}",namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "memoryRequests":
            return `sum(kube_pod_container_resource_requests{pod=~"${opts.pods}",resource="memory",namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "memoryLimits":
            return `sum(kube_pod_container_resource_limits{pod=~"${opts.pods}",resource="memory",namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "fsUsage":
            return `sum(container_fs_usage_bytes{container!="POD",container!="",pod=~"${opts.pods}",namespace="${opts.namespace}"}) by (${opts.selector})`;
          case "networkReceive":
            return `sum(rate(container_network_receive_bytes_total{pod=~"${opts.pods}",namespace="${opts.namespace}"}[${this.rateAccuracy}])) by (${opts.selector})`;
          case "networkTransmit":
            return `sum(rate(container_network_transmit_bytes_total{pod=~"${opts.pods}",namespace="${opts.namespace}"}[${this.rateAccuracy}])) by (${opts.selector})`;
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
            return this.bytesSent(opts.ingress, opts.namespace, "^2\\\\d*");
          case "bytesSentFailure":
            return this.bytesSent(opts.ingress, opts.namespace, "^5\\\\d*");
          case "requestDurationSeconds":
            return `sum(rate(nginx_ingress_controller_request_duration_seconds_sum{ingress="${opts.ingress}",namespace="${opts.namespace}"}[${this.rateAccuracy}])) by (ingress, namespace)`;
          case "responseDurationSeconds":
            return `sum(rate(nginx_ingress_controller_response_duration_seconds_sum{ingress="${opts.ingress}",namespace="${opts.namespace}"}[${this.rateAccuracy}])) by (ingress, namespace)`;
        }
        break;
    }

    throw new Error(`Unknown query name ${inspect(queryName, false, undefined, false)} for category: ${inspect(opts.category, false, undefined, false)}`);
  }
}
