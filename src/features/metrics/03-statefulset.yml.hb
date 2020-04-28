apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: prometheus
  namespace: lens-metrics
spec:
  replicas: {{replicas}}
  serviceName: prometheus
  selector:
    matchLabels:
      name: prometheus
  template:
    metadata:
      labels:
        name: prometheus
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
      # <%- if config.node_selector -%>
      # nodeSelector:
      # <%- node_selector.to_h.each do |key, value| -%>
      #   <%= key %>: <%= value %>
      # <%- end -%>
      # <%- end -%>
      # <%- unless config.tolerations.empty? -%>
      # tolerations:
      # <%- config.tolerations.each do |t| -%>
      #   -
      #     <%- t.each do |k,v| -%>
      #     <%= k %>: <%= v %>
      #     <%- end -%>
      # <%- end -%>
      # <%- end -%>
      serviceAccountName: prometheus
      initContainers:
        - name: chown
          image: docker.io/alpine:3.9
          command: ["chown", "-R", "65534:65534", "/var/lib/prometheus"]
          volumeMounts:
            - name: data
              mountPath: /var/lib/prometheus
      containers:
        - name: prometheus
          image: docker.io/prom/prometheus:v2.17.2
          args:
            - --web.listen-address=0.0.0.0:9090
            - --config.file=/etc/prometheus/prometheus.yaml
            - --storage.tsdb.path=/var/lib/prometheus
            - --storage.tsdb.retention.time={{retention.time}}
            - --storage.tsdb.retention.size={{retention.size}}
            - --storage.tsdb.min-block-duration=2h
            - --storage.tsdb.max-block-duration=2h
          ports:
            - name: web
              containerPort: 9090
          volumeMounts:
            - name: config
              mountPath: /etc/prometheus
            - name: rules
              mountPath: /etc/prometheus/rules
            - name: data
              mountPath: /var/lib/prometheus
          readinessProbe:
            httpGet:
              path: /-/ready
              port: 9090
            initialDelaySeconds: 10
            timeoutSeconds: 10
          livenessProbe:
            httpGet:
              path: /-/healthy
              port: 9090
            initialDelaySeconds: 10
            timeoutSeconds: 10
          resources:
            requests:
              cpu: 100m
              memory: 512Mi
      terminationGracePeriodSeconds: 30
      volumes:
        - name: config
          configMap:
            name: prometheus-config
        - name: rules
          configMap:
            name: prometheus-rules
        {{#unless persistence.enabled}}
        - name: data
          emptyDir: {}
        {{/unless}}
  {{#if persistence.enabled}}
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes:
        - ReadWriteOnce
        {{#if persistence.storageClass}}
        storageClassName: "{{persistence.storageClass}}"
        {{/if}}
        resources:
          requests:
            storage: {{persistence.size}}
  {{/if}}
