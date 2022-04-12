/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import createStoresAndApisInjectable from "../../../renderer/create-stores-apis.injectable";
import { getDiForUnitTesting } from "../../../renderer/getDiForUnitTesting";
import apiKubeInjectable from "../api-kube.injectable";
import type { StatefulSetApi } from "../endpoints";
import statefulSetApiInjectable from "../endpoints/stateful-set.api.injectable";
import type { KubeJsonApi } from "../kube-json-api";

describe("StatefulSetApi", () => {
  let statefulSetApi: StatefulSetApi;
  let kubeJsonApi: jest.Mocked<KubeJsonApi>;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(createStoresAndApisInjectable, () => true);
    kubeJsonApi = {
      getResponse: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      del: jest.fn(),
    } as never;
    di.override(apiKubeInjectable, () => kubeJsonApi);

    statefulSetApi = di.inject(statefulSetApiInjectable);
  });

  describe("scale", () => {
    it("requests Kubernetes API with PATCH verb and correct amount of replicas", () => {
      statefulSetApi.scale({ namespace: "default", name: "statefulset-1" }, 5);

      expect(kubeJsonApi.patch).toHaveBeenCalledWith("/apis/apps/v1/namespaces/default/statefulsets/statefulset-1/scale", {
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
    });
  });
});
