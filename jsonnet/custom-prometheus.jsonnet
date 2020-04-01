{
  // Add Lens metric relabelings for custom prometheus instances installed with kube-prometheus
  // https://github.com/lensapp/lens/blob/master/troubleshooting/custom-prometheus.md
  nodeExporter+:: {
    serviceMonitor+: {
      spec+: {
        endpoints: std.map(function(endpoint)
          if endpoint.port == "https" then
            endpoint {
              relabelings+: [
                {
                  action: 'replace',
                  regex: '(.*)',
                  replacement: '$1',
                  sourceLabels: ['__meta_kubernetes_pod_node_name'],
                  targetLabel: 'kubernetes_node',
                }
              ],
            }
          else
            endpoint,
          super.endpoints
        ),
      },
    },
  },
  prometheus+:: {
    serviceMonitorKubelet+: {
      spec+: {
        metricRelabelings+: [
          {
            action: 'replace',
            sourceLabels: ['node'],
            targetLabel: 'instance',
          },
        ],
      },
    },
  },
}
