import { KubeApi } from "../kube-api";

describe("KubeApi", () => {
  it("uses url from apiBase if apiBase contains the resource", async () => {
    (fetch as any).mockResponse(async (request: any) => {
      if (request.url === "/api-kube/apis/networking.k8s.io/v1") {
        return {
          body: JSON.stringify({
            resources: [{
              name: "ingresses"
            }] as any []
          })
        };
      } else if (request.url === "/api-kube/apis/extensions/v1beta1") {
        // Even if the old API contains ingresses, KubeApi should prefer the apiBase url
        return {
          body: JSON.stringify({
            resources: [{
              name: "ingresses"
            }] as any []
          })
        };
      } else {
        return {
          body: JSON.stringify({
            resources: [] as any []
          })
        };
      }
    });

    const apiBase = "/apis/networking.k8s.io/v1/ingresses";
    const fallbackApiBase = "/apis/extensions/v1beta1/ingresses";
    const kubeApi = new KubeApi({
      apiBase,
      fallbackApiBases: [fallbackApiBase],
      checkPreferredVersion: true,
    });

    await kubeApi.get();
    expect(kubeApi.apiPrefix).toEqual("/apis");
    expect(kubeApi.apiGroup).toEqual("networking.k8s.io");
  });

  it("uses url from fallbackApiBases if apiBase lacks the resource", async () => {
    (fetch as any).mockResponse(async (request: any) => {
      if (request.url === "/api-kube/apis/networking.k8s.io/v1") {
        return {
          body: JSON.stringify({
            resources: [] as any []
          })
        };
      } else if (request.url === "/api-kube/apis/extensions/v1beta1") {
        return {
          body: JSON.stringify({
            resources: [{
              name: "ingresses"
            }] as any []
          })
        };
      } else {
        return {
          body: JSON.stringify({
            resources: [] as any []
          })
        };
      }
    });

    const apiBase = "apis/networking.k8s.io/v1/ingresses";
    const fallbackApiBase = "/apis/extensions/v1beta1/ingresses";
    const kubeApi = new KubeApi({
      apiBase,
      fallbackApiBases: [fallbackApiBase],
      checkPreferredVersion: true,
    });

    await kubeApi.get();
    expect(kubeApi.apiPrefix).toEqual("/apis");
    expect(kubeApi.apiGroup).toEqual("extensions");
  });
});
