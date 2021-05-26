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

import type { PrometheusProvider, PrometheusQueryOpts, PrometheusQuery, PrometheusService } from "./provider-registry";
import type { CoreV1Api, V1Service } from "@kubernetes/client-node";
import logger from "../logger";

export class PrometheusOperator implements PrometheusProvider {
  rateAccuracy = "1m";
  id = "operator";
  name = "Prometheus Operator";

  public async getPrometheusService(client: CoreV1Api): Promise<PrometheusService | void> {
    try {
      let service: V1Service;

      for (const labelSelector of ["operated-prometheus=true", "self-monitor=true"]) {
        if (!service) {
          const serviceList = await client.listServiceForAllNamespaces(null, null, null, labelSelector);

          service = serviceList.body.items[0];
        }
      }
      if (!service) return;

      return {
        id: this.id,
        namespace: service.metadata.namespace,
        service: service.metadata.name,
        port: service.spec.ports[0].port
      };
    } catch(error) {
      logger.warn(`PrometheusOperator: failed to list services: ${error.toString()}`);

      return;
    }
  }

  public getQueries(opts: PrometheusQueryOpts): PrometheusQuery | void {
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
          diskUsage: `sum(kubelet_volume_stats_used_bytes{persistentvolumeclaim="${opts.pvc}",namespace="${opts.namespace}"}) by (persistentvolumeclaim, namespace)`,
          diskCapacity: `sum(kubelet_volume_stats_capacity_bytes{persistentvolumeclaim="${opts.pvc}",namespace="${opts.namespace}"}) by (persistentvolumeclaim, namespace)`
        };
      case "ingress":
        const bytesSent = (ingress: string, namespace: string, statuses: string) =>
          `sum(rate(nginx_ingress_controller_bytes_sent_sum{ingress="${ingress}",namespace="${namespace}",status=~"${statuses}"}[${this.rateAccuracy}])) by (ingress, namespace)`;

        return {
          bytesSentSuccess: bytesSent(opts.ingress, opts.namespace, "^2\\\\d*"),
          bytesSentFailure: bytesSent(opts.ingress, opts.namespace, "^5\\\\d*"),
          requestDurationSeconds: `sum(rate(nginx_ingress_controller_request_duration_seconds_sum{ingress="${opts.ingress}",namespace="${opts.namespace}"}[${this.rateAccuracy}])) by (ingress, namespace)`,
          responseDurationSeconds: `sum(rate(nginx_ingress_controller_response_duration_seconds_sum{ingress="${opts.ingress}",namespace="${opts.namespace}"}[${this.rateAccuracy}])) by (ingress, namespace)`
        };
    }
  }
}
