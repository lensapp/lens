import { KubeObject } from "./kube-object";

describe("kube object tests", () => {
  it("should allow an object to be created when missing uid", () => {
    expect(
      () =>
        new KubeObject({
          apiVersion: "metrics.k8s.io/v1beta1",
          containers: [
            {
              name: "cert-manager",
              usage: {
                cpu: "472721n",
                memory: "74404Ki",
              },
            },
          ],
          kind: "PodMetrics",
          metadata: {
            creationTimestamp: "2023-05-24T14:17:01Z",
            labels: {
              app: "cert-manager",
              "app.kubernetes.io/component": "controller",
              "app.kubernetes.io/instance": "cert-manager",
              "app.kubernetes.io/managed-by": "Helm",
              "app.kubernetes.io/name": "cert-manager",
              "app.kubernetes.io/version": "v1.5.5",
              "helm.sh/chart": "cert-manager-v1.5.5",
              "pod-template-hash": "54cbdfb45c",
            },
            name: "cert-manager-54cbdfb45c-n4kp9",
            namespace: "cert-manager",
            selfLink: "/apis/metrics.k8s.io/v1beta1/namespaces/cert-manager/pods/cert-manager-54cbdfb45c-n4kp9",
            resourceVersion: "123",
          },
          timestamp: "2023-05-24T14:16:39Z",
          window: "16s",
        }),
    ).not.toThrow();
  });

  it("should allow an object to be created when missing resourceVersion", () => {
    expect(
      () =>
        new KubeObject({
          apiVersion: "metrics.k8s.io/v1beta1",
          containers: [
            {
              name: "cert-manager",
              usage: {
                cpu: "472721n",
                memory: "74404Ki",
              },
            },
          ],
          kind: "PodMetrics",
          metadata: {
            creationTimestamp: "2023-05-24T14:17:01Z",
            labels: {
              app: "cert-manager",
              "app.kubernetes.io/component": "controller",
              "app.kubernetes.io/instance": "cert-manager",
              "app.kubernetes.io/managed-by": "Helm",
              "app.kubernetes.io/name": "cert-manager",
              "app.kubernetes.io/version": "v1.5.5",
              "helm.sh/chart": "cert-manager-v1.5.5",
              "pod-template-hash": "54cbdfb45c",
            },
            name: "cert-manager-54cbdfb45c-n4kp9",
            namespace: "cert-manager",
            selfLink: "/apis/metrics.k8s.io/v1beta1/namespaces/cert-manager/pods/cert-manager-54cbdfb45c-n4kp9",
            uid: "123",
          },
          timestamp: "2023-05-24T14:16:39Z",
          window: "16s",
        }),
    ).not.toThrow();
  });

  it("should allow an object to be created when missing resourceVersion and uid", () => {
    expect(
      () =>
        new KubeObject({
          apiVersion: "metrics.k8s.io/v1beta1",
          containers: [
            {
              name: "cert-manager",
              usage: {
                cpu: "472721n",
                memory: "74404Ki",
              },
            },
          ],
          kind: "PodMetrics",
          metadata: {
            creationTimestamp: "2023-05-24T14:17:01Z",
            labels: {
              app: "cert-manager",
              "app.kubernetes.io/component": "controller",
              "app.kubernetes.io/instance": "cert-manager",
              "app.kubernetes.io/managed-by": "Helm",
              "app.kubernetes.io/name": "cert-manager",
              "app.kubernetes.io/version": "v1.5.5",
              "helm.sh/chart": "cert-manager-v1.5.5",
              "pod-template-hash": "54cbdfb45c",
            },
            name: "cert-manager-54cbdfb45c-n4kp9",
            namespace: "cert-manager",
            selfLink: "/apis/metrics.k8s.io/v1beta1/namespaces/cert-manager/pods/cert-manager-54cbdfb45c-n4kp9",
          },
          timestamp: "2023-05-24T14:16:39Z",
          window: "16s",
        }),
    ).not.toThrow();
  });
});
