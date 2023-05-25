import { KubeObject } from "./kube-object";

const getStubData = () => ({
  apiVersion: "metrics.k8s.io/v1beta1",
  kind: "PodMetrics",
  metadata: {
    creationTimestamp: "2023-05-24T14:17:01Z",
    name: "cert-manager-54cbdfb45c-n4kp9",
    namespace: "cert-manager",
    selfLink: "/apis/metrics.k8s.io/v1beta1/namespaces/cert-manager/pods/cert-manager-54cbdfb45c-n4kp9",
    uid: "123" as string | undefined,
    resourceVersion: "foobar" as string | undefined,
  },
});

describe("kube object tests", () => {
  it("given '.metadata.uid' is missing, then KubeObject constructor does not throw", () => {
    const data = getStubData();

    delete data.metadata.uid;
    expect(() => new KubeObject(data)).not.toThrow();
  });

  it("given '.metadata.resourceVersion' is missing, then KubeObject constructor does not throw", () => {
    const data = getStubData();

    delete data.metadata.resourceVersion;
    expect(() => new KubeObject(data)).not.toThrow();
  });

  it("given both '.metadata.resourceVersion' and '.metadata.uid' are missing, then KubeObject constructor does not throw", () => {
    const data = getStubData();

    delete data.metadata.uid;
    delete data.metadata.resourceVersion;
    expect(() => new KubeObject(data)).not.toThrow();
  });

  it("given '.metadata.uid' exist, then KubeObject.getId() should return it", () => {
    const data = getStubData();
    const obj = new KubeObject(data);

    expect(obj.getId()).toEqual("123");
  });

  it("given '.metadata.uid' is missing, then KubeObject.getId() should return '.metadata.selfLink'", () => {
    const data = getStubData();

    delete data.metadata.uid;
    const obj = new KubeObject(data);

    expect(obj.getId()).toEqual(
      "/apis/metrics.k8s.io/v1beta1/namespaces/cert-manager/pods/cert-manager-54cbdfb45c-n4kp9",
    );
  });

  it("given '.metadata.resourceVersion' exist, then KubeObject.getResourceVersion() should return it", () => {
    const data = getStubData();
    const obj = new KubeObject(data);

    expect(obj.getResourceVersion()).toEqual("foobar");
  });

  it("given '.metadata.resourceVersion' is missing, then KubeObject.getResourceVersion() should return an empty string", () => {
    const data = getStubData();

    delete data.metadata.resourceVersion;
    const obj = new KubeObject(data);

    expect(obj.getResourceVersion()).toEqual("");
  });
});
