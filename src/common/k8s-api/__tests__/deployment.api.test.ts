/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { DeploymentApi } from "../endpoints/deployment.api";
import type { KubeJsonApi } from "../kube-json-api";

class DeploymentApiTest extends DeploymentApi {
  declare protected request: KubeJsonApi;

  public setRequest(request: KubeJsonApi) {
    this.request = request;
  }
}

describe("DeploymentApi", () => {
  describe("scale", () => {
    const requestMock = {
      patch: () => ({}),
    } as unknown as KubeJsonApi;

    const sub = new DeploymentApiTest();

    sub.setRequest(requestMock);

    it("requests Kubernetes API with PATCH verb and correct amount of replicas", () => {
      const patchSpy = jest.spyOn(requestMock, "patch");

      sub.scale({ namespace: "default", name: "deployment-1" }, 5);

      expect(patchSpy).toHaveBeenCalledWith("/apis/apps/v1/namespaces/default/deployments/deployment-1/scale", {
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
