/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { ApiManager } from "../api-manager";
import apiManagerInjectable from "../api-manager.injectable";
import { KubeApi } from "../kube-api";
import { KubeObject } from "../kube-object";
import { KubeObjectStore } from "../kube-object.store";

class TestApi extends KubeApi<KubeObject> {
  protected checkPreferredVersion() {
    return Promise.resolve();
  }
}

describe("ApiManager", () => {
  let di: ConfigurableDependencyInjectionContainer;
  let apiManager: ApiManager;

  beforeEach(() => {
    di = getDiForUnitTesting();
    apiManager = di.inject(apiManagerInjectable);
  });

  it("allows apis to be accessible by their new apiBase if it changes", () => {
    const apiBase = "apis/v1/foo";
    const fallbackApiBase = "/apis/extensions/v1beta1/foo";
    const kubeApi = new TestApi({
      objectConstructor: KubeObject,
      apiBase,
      fallbackApiBases: [fallbackApiBase],
      checkPreferredVersion: true,
    });
    const kubeStore = new class extends KubeObjectStore<KubeObject> {
      api = kubeApi;
    };

    apiManager.registerApi(kubeApi);
    apiManager.registerStore(kubeStore);

    // Test that store is returned with original apiBase
    expect(apiManager.getStore(kubeApi)).toBe(kubeStore);

    // Change apiBase similar as checkPreferredVersion does
    Object.defineProperty(kubeApi, "apiBase", { value: fallbackApiBase });
    apiManager.registerApi(fallbackApiBase, kubeApi);

    // Test that store is returned with new apiBase
    expect(apiManager.getStore(kubeApi)).toBe(kubeStore);
  });
});
