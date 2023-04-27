/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getDiForUnitTesting } from "../../../renderer/getDiForUnitTesting";
import storesAndApisCanBeCreatedInjectable from "../../../renderer/stores-apis-can-be-created.injectable";
import apiKubeInjectable from "../../../renderer/k8s/api-kube.injectable";
import type { DeploymentApi } from "../endpoints/deployment.api";
import deploymentApiInjectable from "../endpoints/deployment.api.injectable";
import type { KubeJsonApi } from "../kube-json-api";

describe("DeploymentApi", () => {
  let deploymentApi: DeploymentApi;
  let kubeJsonApi: jest.Mocked<KubeJsonApi>;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    di.override(storesAndApisCanBeCreatedInjectable, () => true);
    kubeJsonApi = {
      getResponse: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      del: jest.fn(),
    } as never;
    di.override(apiKubeInjectable, () => kubeJsonApi);

    deploymentApi = di.inject(deploymentApiInjectable);
  });

  describe("scale", () => {
    it("requests Kubernetes API with PATCH verb and correct amount of replicas", () => {
      void deploymentApi.scale({ namespace: "default", name: "deployment-1" }, 5);

      expect(kubeJsonApi.patch).toHaveBeenCalledWith("/apis/apps/v1/namespaces/default/deployments/deployment-1/scale", {
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
