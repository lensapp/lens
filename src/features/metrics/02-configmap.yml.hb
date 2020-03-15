apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: lens-metrics
data:
  prometheus.yaml: |-
    # Global config
    global:
      scrape_interval: 15s

    {{#if alertManagers}}
    # AlertManager
    alerting:
      alertmanagers:
      - static_configs:
        - targets:
          {{#each alertManagers}}
          - {{this}}
          {{/each}}
    {{/if}}

    # Scrape configs for running Prometheus on a Kubernetes cluster.
    # This uses separate scrape configs for cluster components (i.e. API server, node)
    # and services to allow each to use different authentication configs.
    #
    # Kubernetes labels will be added as Prometheus labels on metrics via the
    # `labelmap` relabeling action.
    scrape_configs:

    # Scrape config for API servers.
    #
    # Kubernetes exposes API servers as endpoints to the default/kubernetes
    # service so this uses `endpoints` role and uses relabelling to only keep
    # the endpoints associated with the default/kubernetes service using the
    # default named port `https`. This works for single API server deployments as
    # well as HA API server deployments.
    - job_name: 'kubernetes-apiservers'
      kubernetes_sd_configs:
      - role: endpoints

      scheme: https
      tls_config:
        ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        # Using endpoints to discover kube-apiserver targets finds the pod IP
        # (host IP since apiserver uses host network) which is not used in
        # the server certificate.
        insecure_skip_verify: true
      bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token

      # Keep only the default/kubernetes service endpoints for the https port. This
      # will add targets for each API server which Kubernetes adds an endpoint to
      # the default/kubernetes service.
      relabel_configs:
      - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
        action: keep
        regex: default;kubernetes;https
      - replacement: apiserver
        action: replace
        target_label: job

    # Scrape config for node (i.e. kubelet) /metrics (e.g. 'kubelet_'). Explore
    # metrics from a node by scraping kubelet (127.0.0.1:10250/metrics).
    - job_name: 'kubelet'
      kubernetes_sd_configs:
      - role: node

      scheme: https
      tls_config:
        ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        # Kubelet certs don't have any fixed IP SANs
        insecure_skip_verify: true
      bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token

      relabel_configs:
      - action: labelmap
        regex: __meta_kubernetes_node_label_(.+)
      - replacement: 'lens-metrics'
        target_label: kubernetes_namespace

      metric_relabel_configs:
      - source_labels:
          - namespace
        action: replace
        regex: (.+)
        target_label: kubernetes_namespace

    # Scrape config for Kubelet cAdvisor. Explore metrics from a node by
    # scraping kubelet (127.0.0.1:10250/metrics/cadvisor).
    - job_name: 'kubernetes-cadvisor'
      kubernetes_sd_configs:
      - role: node

      scheme: https
      metrics_path: /metrics/cadvisor
      tls_config:
        # Kubelet certs don't have any fixed IP SANs
        insecure_skip_verify: true
        ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
      bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token

      relabel_configs:
      - action: labelmap
        regex: __meta_kubernetes_node_label_(.+)
      metric_relabel_configs:
      - source_labels:
          - namespace
        action: replace
        target_label: kubernetes_namespace
      - source_labels:
        - pod
        regex: (.*)
        replacement: $1
        action: replace
        target_label: pod_name
      - source_labels:
        - container
        regex: (.*)
        replacement: $1
        action: replace
        target_label: container_name

    # Scrap etcd metrics from masters via etcd-scraper-proxy
    - job_name: 'etcd'
      kubernetes_sd_configs:
      - role: pod
      scheme: http
      relabel_configs:
        - source_labels: [__meta_kubernetes_namespace]
          action: keep
          regex: 'kube-system'
        - source_labels: [__meta_kubernetes_pod_label_component]
          action: keep
          regex: 'etcd-scraper-proxy'
        - action: labelmap
          regex: __meta_kubernetes_pod_label_(.+)

    # Scrape config for service endpoints.
    #
    # The relabeling allows the actual service scrape endpoint to be configured
    # via the following annotations:
    #
    # * `prometheus.io/scrape`: Only scrape services that have a value of `true`
    # * `prometheus.io/scheme`: If the metrics endpoint is secured then you will need
    # to set this to `https` & most likely set the `tls_config` of the scrape config.
    # * `prometheus.io/path`: If the metrics path is not `/metrics` override this.
    # * `prometheus.io/port`: If the metrics are exposed on a different port to the
    # service then set this appropriately.
    - job_name: 'kubernetes-service-endpoints'

      kubernetes_sd_configs:
      - role: endpoints

      relabel_configs:
      - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_scheme]
        action: replace
        target_label: __scheme__
        regex: (https?)
      - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_service_annotation_prometheus_io_port]
        action: replace
        target_label: __address__
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
      - action: labelmap
        regex: __meta_kubernetes_service_label_(.+)
      - source_labels: [__meta_kubernetes_service_name]
        action: replace
        target_label: job
      - action: replace
        source_labels:
        - __meta_kubernetes_pod_node_name
        target_label: kubernetes_node
      - source_labels: [__meta_kubernetes_namespace]
        action: replace
        target_label: kubernetes_namespace
      metric_relabel_configs:
      - source_labels:
          - namespace
        action: replace
        regex: (.+)
        target_label: kubernetes_namespace

    # Example scrape config for probing services via the Blackbox Exporter.
    #
    # The relabeling allows the actual service scrape endpoint to be configured
    # via the following annotations:
    #
    # * `prometheus.io/probe`: Only probe services that have a value of `true`
    - job_name: 'kubernetes-services'

      metrics_path: /probe
      params:
        module: [http_2xx]

      kubernetes_sd_configs:
      - role: service

      relabel_configs:
      - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_probe]
        action: keep
        regex: true
      - source_labels: [__address__]
        target_label: __param_target
      - target_label: __address__
        replacement: blackbox
      - source_labels: [__param_target]
        target_label: instance
      - action: labelmap
        regex: __meta_kubernetes_service_label_(.+)
      - source_labels: [__meta_kubernetes_service_name]
        target_label: job
      metric_relabel_configs:
      - source_labels:
          - namespace
        action: replace
        regex: (.+)
        target_label: kubernetes_namespace

    # Example scrape config for pods
    #
    # The relabeling allows the actual pod scrape endpoint to be configured via the
    # following annotations:
    #
    # * `prometheus.io/scrape`: Only scrape pods that have a value of `true`
    # * `prometheus.io/path`: If the metrics path is not `/metrics` override this.
    # * `prometheus.io/port`: Scrape the pod on the indicated port instead of the
    # pod's declared ports (default is a port-free target if none are declared).
    - job_name: 'kubernetes-pods'

      kubernetes_sd_configs:
      - role: pod

      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
      - action: labelmap
        regex: __meta_kubernetes_pod_label_(.+)
      - source_labels: [__meta_kubernetes_namespace]
        action: replace
        target_label: kubernetes_namespace
      - source_labels: [__meta_kubernetes_pod_name]
        action: replace
        target_label: kubernetes_pod_name
      metric_relabel_configs:
      - source_labels:
          - namespace
        action: replace
        regex: (.+)
        target_label: kubernetes_namespace

    # Rule files
    rule_files:
      - "/etc/prometheus/rules/*.rules"
      - "/etc/prometheus/rules/*.yaml"
      - "/etc/prometheus/rules/*.yml"
