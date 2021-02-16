import { ingressStore } from "../../components/+network-ingresses/ingress.store";
import { apiManager } from "../api-manager";
import { KubeApi } from "../kube-api";

class TestApi extends KubeApi {

  protected async checkPreferredVersion() {
    return;
  }
}

describe("ApiManager", () => {
  describe("registerApi", () => {
    it("re-register store if apiBase changed", async () => {
      const apiBase = "apis/v1/foo";
      const fallbackApiBase = "/apis/extensions/v1beta1/foo";
      const kubeApi = new TestApi({
        apiBase,
        fallbackApiBases: [fallbackApiBase],
        checkPreferredVersion: true,
      });

      apiManager.registerApi(apiBase, kubeApi);

      // Define to use test api for ingress store
      Object.defineProperty(ingressStore, "api", { value: kubeApi });
      apiManager.registerStore(ingressStore, [kubeApi]);

      // Test that store is returned with original apiBase
      expect(apiManager.getStore(kubeApi)).toBe(ingressStore);

      // Change apiBase similar as checkPreferredVersion does
      Object.defineProperty(kubeApi, "apiBase", { value: fallbackApiBase });
      apiManager.registerApi(fallbackApiBase, kubeApi);

      // Test that store is returned with new apiBase
      expect(apiManager.getStore(kubeApi)).toBe(ingressStore);
    });
  });
});
