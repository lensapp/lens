# Using Custom Prometheus

When using custom prometheus with Lens app, Lens expects certain things for prometheus rules and labels. Below is listed the changes required to see metrics properly.

## kube-prometheus

### Manual

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

2. To see cluster's pod usage on cluster overview properly, please add `metricRelabelings` to `kubelet` service monitor (`kubectl edit -n monitoring servicemonitors kubelet`)

```
metricRelabelings:
- action: replace
  sourceLabels:
  - node
  targetLabel: instance
```

### Jsonnet

The required label replacements are bundled in [jsonnet/lens/custom-prometheus](../jsonnet/lens/custom-prometheus.jsonnet).
This file is currently for jsonnet versions >= 0.8.0
To install it copy the file or use [Jsonnet Bundler](https://github.com/jsonnet-bundler/jsonnet-bundler).

```bash
jb init && jb install https://github.com/lensapp/lens/jsonnet/lens@master
```

When the installation was successful include it into your definitions. Using the [example](https://github.com/coreos/kube-prometheus#compiling)
of kube-prometheus, e.g.:

```
local kp =
  (import 'kube-prometheus/kube-prometheus.libsonnet') +
  (import 'lens/custom-prometheus.jsonnet') +
  {
    _config+:: {
      namespace: 'monitoring',
    },
  };
...
```

## Helm chart

1. To see cpu metrics properly, please set value of `server.global.scrape_timeout` less than 1 minute, for example

```
helm upgrade --set server.global.scrape_interval=30s prometheus stable/prometheus
```
