import { KubeObject } from "./kube-object";

describe("kube object tests", () => {
  it("should allow an object to be created when missing uid", () => {
    expect(
      () =>
        new KubeObject({
          apiVersion: "metrics.k8s.io/v1beta1",
          kind: "PodMetrics",
          metadata: {
            creationTimestamp: "2023-05-24T14:17:01Z",
            name: "cert-manager-54cbdfb45c-n4kp9",
            namespace: "cert-manager",
            selfLink: "/apis/metrics.k8s.io/v1beta1/namespaces/cert-manager/pods/cert-manager-54cbdfb45c-n4kp9",
            resourceVersion: "123",
          },
        }),
    ).not.toThrow();
  });

  it("should allow an object to be created when missing resourceVersion", () => {
    expect(
      () =>
        new KubeObject({
          apiVersion: "metrics.k8s.io/v1beta1",
          kind: "PodMetrics",
          metadata: {
            creationTimestamp: "2023-05-24T14:17:01Z",
            name: "cert-manager-54cbdfb45c-n4kp9",
            namespace: "cert-manager",
            selfLink: "/apis/metrics.k8s.io/v1beta1/namespaces/cert-manager/pods/cert-manager-54cbdfb45c-n4kp9",
            uid: "123",
          },
        }),
    ).not.toThrow();
  });

  it("should allow an object to be created when missing resourceVersion and uid", () => {
    expect(
      () =>
        new KubeObject({
          apiVersion: "metrics.k8s.io/v1beta1",
          kind: "PodMetrics",
          metadata: {
            creationTimestamp: "2023-05-24T14:17:01Z",
            name: "cert-manager-54cbdfb45c-n4kp9",
            namespace: "cert-manager",
            selfLink: "/apis/metrics.k8s.io/v1beta1/namespaces/cert-manager/pods/cert-manager-54cbdfb45c-n4kp9",
          },
        }),
    ).not.toThrow();
  });

  it("KubeObject.getId() should return the uid if present", () => {
    const obj = new KubeObject({
      apiVersion: "metrics.k8s.io/v1beta1",
      kind: "PodMetrics",
      metadata: {
        creationTimestamp: "2023-05-24T14:17:01Z",
        name: "cert-manager-54cbdfb45c-n4kp9",
        namespace: "cert-manager",
        selfLink: "/apis/metrics.k8s.io/v1beta1/namespaces/cert-manager/pods/cert-manager-54cbdfb45c-n4kp9",
        uid: "foobar",
      },
    });

    expect(obj.getId()).toEqual("foobar");
  });

  it("KubeObject.getId() should return the selfLink if uid is missing", () => {
    const obj = new KubeObject({
      apiVersion: "metrics.k8s.io/v1beta1",
      kind: "PodMetrics",
      metadata: {
        creationTimestamp: "2023-05-24T14:17:01Z",
        name: "cert-manager-54cbdfb45c-n4kp9",
        namespace: "cert-manager",
        selfLink: "/apis/metrics.k8s.io/v1beta1/namespaces/cert-manager/pods/cert-manager-54cbdfb45c-n4kp9",
      },
    });

    expect(obj.getId()).toEqual(
      "/apis/metrics.k8s.io/v1beta1/namespaces/cert-manager/pods/cert-manager-54cbdfb45c-n4kp9",
    );
  });

  it("KubeObject.getResourceVersion() should return the resourceVersion if it is present", () => {
    const obj = new KubeObject({
      apiVersion: "metrics.k8s.io/v1beta1",
      kind: "PodMetrics",
      metadata: {
        creationTimestamp: "2023-05-24T14:17:01Z",
        name: "cert-manager-54cbdfb45c-n4kp9",
        namespace: "cert-manager",
        selfLink: "/apis/metrics.k8s.io/v1beta1/namespaces/cert-manager/pods/cert-manager-54cbdfb45c-n4kp9",
        resourceVersion: "foobar",
      },
    });

    expect(obj.getResourceVersion()).toEqual("foobar");
  });

  it("KubeObject.getResourceVersion() should return '' if the resourceVersion is missing", () => {
    const obj = new KubeObject({
      apiVersion: "metrics.k8s.io/v1beta1",
      kind: "PodMetrics",
      metadata: {
        creationTimestamp: "2023-05-24T14:17:01Z",
        name: "cert-manager-54cbdfb45c-n4kp9",
        namespace: "cert-manager",
        selfLink: "/apis/metrics.k8s.io/v1beta1/namespaces/cert-manager/pods/cert-manager-54cbdfb45c-n4kp9",
      },
    });

    expect(obj.getResourceVersion()).toEqual("");
  });
});
