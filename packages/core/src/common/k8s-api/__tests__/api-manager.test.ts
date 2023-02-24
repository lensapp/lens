/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import createClusterInjectable from "../../../main/create-cluster/create-cluster.injectable";
import clusterFrameContextForNamespacedResourcesInjectable from "../../../renderer/cluster-frame-context/for-namespaced-resources.injectable";
import hostedClusterInjectable from "../../../renderer/cluster-frame-context/hosted-cluster.injectable";
import { getDiForUnitTesting } from "../../../renderer/getDiForUnitTesting";
import storesAndApisCanBeCreatedInjectable from "../../../renderer/stores-apis-can-be-created.injectable";
import directoryForKubeConfigsInjectable from "../../app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import directoryForUserDataInjectable from "../../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import loggerInjectable from "../../logger.injectable";
import type { ApiManager } from "../api-manager";
import apiManagerInjectable from "../api-manager/manager.injectable";
import { KubeApi } from "../kube-api";
import { KubeObject } from "../kube-object";
import { KubeObjectStore } from "../kube-object.store";
import maybeKubeApiInjectable from "../maybe-kube-api.injectable";

// eslint-disable-next-line no-restricted-imports
import { KubeApi as ExternalKubeApi } from "../../../extensions/common-api/k8s-api";

class TestApi extends KubeApi<KubeObject> {
  protected async checkPreferredVersion() {
    return;
  }
}

class TestStore extends KubeObjectStore<KubeObject, TestApi> {

}

describe("ApiManager", () => {
  let apiManager: ApiManager;
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");
    di.override(directoryForKubeConfigsInjectable, () => "/some-kube-configs");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);

    const createCluster = di.inject(createClusterInjectable);

    di.override(hostedClusterInjectable, () => createCluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some-path-to-a-kubeconfig",
    }, {
      clusterServerUrl: "https://localhost:8080",
    }));

    apiManager = di.inject(apiManagerInjectable);
  });

  describe("registerApi", () => {
    it("re-register store if apiBase changed", () => {
      const apiBase = "apis/v1/foo";
      const fallbackApiBase = "/apis/extensions/v1beta1/foo";
      const kubeApi = new TestApi({
        logger: di.inject(loggerInjectable),
        maybeKubeApi: di.inject(maybeKubeApiInjectable),
      }, {
        objectConstructor: KubeObject,
        apiBase,
        kind: "foo",
        fallbackApiBases: [fallbackApiBase],
        checkPreferredVersion: true,
      });
      const kubeStore = new TestStore({
        context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
        logger: di.inject(loggerInjectable),
      }, kubeApi);

      apiManager.registerApi(kubeApi);

      // Define to use test api for ingress store
      Object.defineProperty(kubeStore, "api", { value: kubeApi });
      apiManager.registerStore(kubeStore);

      // Test that store is returned with original apiBase
      expect(apiManager.getStore(kubeApi)).toBe(kubeStore);

      // Change apiBase similar as checkPreferredVersion does
      Object.defineProperty(kubeApi, "apiBase", { value: fallbackApiBase });
      apiManager.registerApi(kubeApi);

      // Test that store is returned with new apiBase
      expect(apiManager.getStore(kubeApi)).toBe(kubeStore);
    });
  });

  describe("technical tests for autorun", () => {
    it("given two extensions register apis with the same apibase, settle into using the second", () => {
      const apiBase = "/apis/aquasecurity.github.io/v1alpha1/vulnerabilityreports";
      const firstApi = Object.assign(new ExternalKubeApi({
        objectConstructor: KubeObject,
        apiBase,
        kind: "VulnerabilityReport",
      }), {
        myField: 1,
      });
      const secondApi = Object.assign(new ExternalKubeApi({
        objectConstructor: KubeObject,
        apiBase,
        kind: "VulnerabilityReport",
      }), {
        myField: 2,
      });

      void firstApi;
      void secondApi;

      expect(apiManager.getApi(apiBase)).toMatchObject({
        myField: 2,
      });
    });
  });
});
