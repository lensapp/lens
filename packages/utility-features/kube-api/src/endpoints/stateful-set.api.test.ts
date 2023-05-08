/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeJsonApi, StatefulSetApi } from "@k8slens/kube-api";
import { flushPromises } from "@k8slens/test-utils";
import asyncFn from "@async-fn/jest";
import type { AsyncFnMock } from "@async-fn/jest";

describe("StatefulSetApi", () => {
  let statefulSetApi: StatefulSetApi;
  let kubeJsonApi: KubeJsonApi;
  let kubeJsonApiPatchMock: AsyncFnMock<KubeJsonApi["patch"]>;
  let kubeJsonApiGetMock: AsyncFnMock<KubeJsonApi["get"]>;

  beforeEach(() => {
    kubeJsonApiGetMock = asyncFn<KubeJsonApi["get"]>();
    kubeJsonApiPatchMock = asyncFn<KubeJsonApi["patch"]>();
    kubeJsonApi = {
      get: kubeJsonApiGetMock,
      patch: kubeJsonApiPatchMock,
    } as Partial<KubeJsonApi> as KubeJsonApi;
    statefulSetApi = new StatefulSetApi({
      logger: {
        info: jest.fn(),
        debug: jest.fn(),
        error: jest.fn(),
      } as any,
      maybeKubeApi: kubeJsonApi,
    });
  });

  describe("scale", () => {
    it("requests Kubernetes API with PATCH verb and correct amount of replicas", async () => {
      const req = statefulSetApi.scale({ namespace: "default", name: "statefulset-1" }, 5);

      await flushPromises();
      expect(kubeJsonApiPatchMock).toHaveBeenCalledWith(
        "/apis/apps/v1/namespaces/default/statefulsets/statefulset-1/scale",
        {
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
        },
      );

      await kubeJsonApiPatchMock.resolve({});
      await req;
    });

    it("requests Kubernetes API with GET verb and correct sub-resource", async () => {
      const req = statefulSetApi.getReplicas({ namespace: "default", name: "statefulset-1" });

      await flushPromises();
      expect(kubeJsonApi.get).toHaveBeenCalledWith("/apis/apps/v1/namespaces/default/statefulsets/statefulset-1/scale");
      await kubeJsonApiGetMock.resolve({ status: { replicas: 10 } });

      expect(await req).toBe(10);
    });
  });
});
