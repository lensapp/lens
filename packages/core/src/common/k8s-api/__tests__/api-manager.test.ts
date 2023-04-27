/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
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
import { KubeObject } from "@k8slens/kube-object";
import { KubeObjectStore } from "../kube-object.store";
import maybeKubeApiInjectable from "../maybe-kube-api.injectable";

// eslint-disable-next-line no-restricted-imports
import { KubeApi as ExternalKubeApi } from "../../../extensions/common-api/k8s-api";
import { Cluster } from "../../cluster/cluster";
import { runInAction } from "mobx";
import { customResourceDefinitionApiInjectionToken } from "../api-manager/crd-api-token";
import assert from "assert";

class TestApi extends KubeApi<KubeObject> {
  protected checkPreferredVersion() {
    return Promise.resolve();
  }
}

class TestStore extends KubeObjectStore<KubeObject, TestApi> {

}

describe("ApiManager", () => {
  let apiManager: ApiManager;
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();

    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");
    di.override(directoryForKubeConfigsInjectable, () => "/some-kube-configs");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);

    di.override(hostedClusterInjectable, () => new Cluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some-path-to-a-kubeconfig",
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

  describe("given than a CRD has a default KubeApi registered for it", () => {
    const apiBase = "/apis/aquasecurity.github.io/v1alpha1/vulnerabilityreports";

    beforeEach(() => {
      runInAction(() => {
        di.register(getInjectable({
          id: `default-kube-api-for-custom-resource-definition-${apiBase}`,
          instantiate: (di) => {
            const objectConstructor = class extends KubeObject {
              static readonly kind = "VulnerabilityReport";
              static readonly namespaced = true;
              static readonly apiBase = apiBase;
            };

            return Object.assign(
              new KubeApi({
                logger: di.inject(loggerInjectable),
                maybeKubeApi: di.inject(maybeKubeApiInjectable),
              }, { objectConstructor }),
              {
                myField: 1,
              },
            );
          },
          injectionToken: customResourceDefinitionApiInjectionToken,
        }));
      });
    });

    it("can be retrieved from apiManager", () => {
      expect(apiManager.getApi(apiBase)).toMatchObject({
        myField: 1,
      });
    });

    it("can have a default KubeObjectStore instance retrieved for it", () => {
      expect(apiManager.getStore(apiBase)).toBeInstanceOf(KubeObjectStore);
    });

    describe("given that an extension registers an api with the same apibase", () => {
      beforeEach(() => {
        void Object.assign(new ExternalKubeApi({
          objectConstructor: KubeObject,
          apiBase,
          kind: "VulnerabilityReport",
        }), {
          myField: 2,
        });
      });

      it("the extension's instance is retrievable instead from apiManager", () => {
        expect(apiManager.getApi(apiBase)).toMatchObject({
          myField: 2,
        });
      });

      it("can have a default KubeObjectStore instance retrieved for it", () => {
        expect(apiManager.getStore(apiBase)).toBeInstanceOf(KubeObjectStore);
      });

      describe("given that an extension registers a store for the same apibase", () => {
        beforeEach(() => {
          const api = apiManager.getApi(apiBase);

          assert(api);

          apiManager.registerStore(Object.assign(
            new KubeObjectStore({
              context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
              logger: di.inject(loggerInjectable),
            }, api),
            {
              someField: 2,
            },
          ));
        });

        it("can gets the custom KubeObjectStore instance instead", () => {
          expect(apiManager.getStore(apiBase)).toMatchObject({
            someField: 2,
          });
        });
      });
    });
  });
});

describe("ApiManger without storesAndApisCanBeCreated", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();

    di.override(storesAndApisCanBeCreatedInjectable, () => false);
  });

  it("should not throw when creating apiManager", () => {
    di.inject(apiManagerInjectable);
  });
});
