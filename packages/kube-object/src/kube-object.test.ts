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
  it("should allow an object to be created when missing uid", () => {
    const data = getStubData();

    delete data.metadata.uid;
    expect(() => new KubeObject(data)).not.toThrow();
  });

  it("should allow an object to be created when missing resourceVersion", () => {
    const data = getStubData();

    delete data.metadata.resourceVersion;
    expect(() => new KubeObject(data)).not.toThrow();
  });

  it("should allow an object to be created when missing resourceVersion and uid", () => {
    const data = getStubData();

    delete data.metadata.uid;
    delete data.metadata.resourceVersion;
    expect(() => new KubeObject(data)).not.toThrow();
  });

  it("KubeObject.getId() should return the uid if present", () => {
    const data = getStubData();
    const obj = new KubeObject(data);

    expect(obj.getId()).toEqual("123");
  });

  it("KubeObject.getId() should return the selfLink if uid is missing", () => {
    const data = getStubData();

    delete data.metadata.uid;
    const obj = new KubeObject(data);

    expect(obj.getId()).toEqual(
      "/apis/metrics.k8s.io/v1beta1/namespaces/cert-manager/pods/cert-manager-54cbdfb45c-n4kp9",
    );
  });

  it("KubeObject.getResourceVersion() should return the resourceVersion if it is present", () => {
    const data = getStubData();
    const obj = new KubeObject(data);

    expect(obj.getResourceVersion()).toEqual("foobar");
  });

  it("KubeObject.getResourceVersion() should return '' if the resourceVersion is missing", () => {
    const data = getStubData();

    delete data.metadata.resourceVersion;
    const obj = new KubeObject(data);

    expect(obj.getResourceVersion()).toEqual("");
  });
});
