# Using Custom Prometheus

When using custom prometheus with Lens app, Lens expects certain things for prometheus rules and labels. Below is listed the changes required to see metrics properly.

## kube-prometheus

1. To see node metrics properly, please add

```
- action: replace
  regex: (.*)
  replacement: $1
  sourceLabels:
  - __meta_kubernetes_pod_node_name
  targetLabel: kubernetes_node
```

relabeling to `node-exporter` servicemonitor crd (for example `kubectl edit -n monitoring servicemonitors node-exporter`).

2. To see cluster's pod usage on cluster overview properly, please add `metricsRelabeling` to `kubelet` service monitor (`kubectl edit -n monitoring servicemonitors node-exporter`)

```
metricRelabelings:
- action: replace
  sourceLabels:
  - node
  targetLabel: instance
```

## Helm chart

1. To see cpu metrics properly, please set value of `server.global.scrape_timeout` less than 1 minute, for example

```
helm upgrade --set server.global.scrape_timeout=30s prometheus stable/prometheus
```

