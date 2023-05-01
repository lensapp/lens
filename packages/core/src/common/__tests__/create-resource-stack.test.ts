/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import kubectlApplyAllInjectable from "../../main/kubectl/kubectl-apply-all.injectable";
import { getDiForUnitTesting } from "../../main/getDiForUnitTesting";
import { KubernetesCluster } from "../catalog-entities";
import createResourceStackInjectable from "../k8s/create-resource-stack.injectable";
import appPathsStateInjectable from "../app-paths/app-paths-state.injectable";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";

describe("create resource stack tests", () => {
  let di: DiContainer;
  let cluster: KubernetesCluster;

  beforeEach(() => {
    di = getDiForUnitTesting();
    cluster = new KubernetesCluster({
      metadata: {
        labels: {},
        name: "some-name",
        uid: "test-cluster",
      },
      spec: {
        kubeconfigContext: "some-context",
        kubeconfigPath: "/some-kubeconfig-path",
      },
      status: {
        phase: "some-phase",
      },
    });

    di.override(appPathsStateInjectable, () => ({
      get: () => ({}),
    }));
    di.override(directoryForUserDataInjectable, () => "/some-directory-for-user-data");

  });

  describe("kubectlApplyFolder", () => {
    it("returns response", async () => {
      di.override(kubectlApplyAllInjectable, () => () => Promise.resolve({
        isOk: true as const,
        value: "success",
      }));

      const createResourceStack = di.inject(createResourceStackInjectable);
      const resourceStack = createResourceStack(cluster, "test");

      const response = await resourceStack.kubectlApplyFolder("/foo/bar");

      expect(response).toEqual("success");
    });

    it("throws on error", async () => {
      di.override(kubectlApplyAllInjectable, () => () => Promise.resolve({
        isOk: false as const,
        error: "No permissions",
      }));

      const createResourceStack = di.inject(createResourceStackInjectable);
      const resourceStack = createResourceStack(cluster, "test");

      await expect(() => resourceStack.kubectlApplyFolder("/foo/bar")).rejects.toThrow("No permissions");
    });
  });
});
