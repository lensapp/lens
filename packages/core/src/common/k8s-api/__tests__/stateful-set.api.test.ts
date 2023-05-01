/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import storesAndApisCanBeCreatedInjectable from "../../../renderer/stores-apis-can-be-created.injectable";
import { getDiForUnitTesting } from "../../../renderer/getDiForUnitTesting";
import apiKubeInjectable from "../../../renderer/k8s/api-kube.injectable";
import type { StatefulSetApi } from "../endpoints";
import statefulSetApiInjectable from "../endpoints/stateful-set.api.injectable";
import type { KubeJsonApi } from "../kube-json-api";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { flushPromises } from "@k8slens/test-utils";

describe("StatefulSetApi", () => {
  let statefulSetApi: StatefulSetApi;
  let kubeJsonApiPatchMock: AsyncFnMock<KubeJsonApi["patch"]>;
  let kubeJsonApiGetMock: AsyncFnMock<KubeJsonApi["get"]>;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    di.override(storesAndApisCanBeCreatedInjectable, () => true);
    kubeJsonApiPatchMock = asyncFn();
    kubeJsonApiGetMock = asyncFn();
    di.override(apiKubeInjectable, () => ({
      get: kubeJsonApiGetMock,
      patch: kubeJsonApiPatchMock,
    } as Partial<KubeJsonApi> as KubeJsonApi));

    statefulSetApi = di.inject(statefulSetApiInjectable);
  });

  describe("scale", () => {
    it("requests Kubernetes API with PATCH verb and correct amount of replicas", async () => {
      const req = statefulSetApi.scale({ namespace: "default", name: "statefulset-1" }, 5);

      await flushPromises();
      expect(kubeJsonApiPatchMock).toHaveBeenCalledWith("/apis/apps/v1/namespaces/default/statefulsets/statefulset-1/scale", {
        data: {
          spec: {
            replicas: 5,
          },
        },
      },
      {
        headers: {
          "content-type": "application/merge-patch+json",
        },
      });

      await kubeJsonApiPatchMock.resolve({});
      await req;
    });

    it("requests Kubernetes API with GET verb and correct sub-resource", async () => {
      const req = statefulSetApi.getReplicas({ namespace: "default", name: "statefulset-1" });

      await flushPromises();
      expect(kubeJsonApiGetMock).toHaveBeenCalledWith("/apis/apps/v1/namespaces/default/statefulsets/statefulset-1/scale");
      await kubeJsonApiGetMock.resolve({ status: { replicas: 10 }});

      expect(await req).toBe(10);
    });
  });
});
