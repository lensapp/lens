/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeJsonApi, DeploymentApi } from "@k8slens/kube-api";

describe("DeploymentApi", () => {
  let deploymentApi: DeploymentApi;
  let kubeJsonApi: jest.Mocked<KubeJsonApi>;

  beforeEach(() => {
    kubeJsonApi = {
      getResponse: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      del: jest.fn(),
    } as never;

    deploymentApi = new DeploymentApi({
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
      await deploymentApi.scale({ namespace: "default", name: "deployment-1" }, 5);

      expect(kubeJsonApi.patch).toHaveBeenCalledWith(
        "/apis/apps/v1/namespaces/default/deployments/deployment-1/scale",
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
    });
  });
});
