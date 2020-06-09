{{#if nodeExporter.enabled}}
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
  namespace: lens-metrics
spec:
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
  selector:
    matchLabels:
      name: node-exporter
      phase: prod
  template:
    metadata:
      labels:
        name: node-exporter
        phase: prod
      annotations:
        seccomp.security.alpha.kubernetes.io/pod: 'docker/default'
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                - key: kubernetes.io/os
                  operator: In
                  values:
                  - linux
              - matchExpressions:
                - key: beta.kubernetes.io/os
                  operator: In
                  values:
                  - linux
      securityContext:
        runAsNonRoot: true
        runAsUser: 65534
      hostPID: true
      containers:
      - name: node-exporter
        image: docker.io/prom/node-exporter:v1.0.0-rc.0
        args:
          - --path.procfs=/host/proc
          - --path.sysfs=/host/sys
          - --path.rootfs=/host/root
          - --collector.filesystem.ignored-mount-points=^/(dev|proc|sys|var/lib/docker|var/lib/containers/.+)($|/)
          - --collector.filesystem.ignored-fs-types=^(autofs|binfmt_misc|cgroup|configfs|debugfs|devpts|devtmpfs|fusectl|hugetlbfs|mqueue|overlay|proc|procfs|pstore|rpc_pipefs|securityfs|sysfs|tracefs)$
        ports:
          - name: metrics
            containerPort: 9100
        resources:
          requests:
            cpu: 10m
            memory: 24Mi
          limits:
            cpu: 200m
            memory: 100Mi
        volumeMounts:
          - name: proc
            mountPath: /host/proc
            readOnly:  true
          - name: sys
            mountPath: /host/sys
            readOnly: true
          - name: root
            mountPath: /host/root
            readOnly: true
      tolerations:
        - effect: NoSchedule
          operator: Exists
      volumes:
        - name: proc
          hostPath:
            path: /proc
        - name: sys
          hostPath:
            path: /sys
        - name: root
          hostPath:
            path: /
{{/if}}
