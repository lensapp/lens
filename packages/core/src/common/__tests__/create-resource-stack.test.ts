/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import kubectlApplyAllInjectable from "../../main/kubectl/kubectl-apply-all.injectable";
import { getDiForUnitTesting } from "../../main/getDiForUnitTesting";
import type { KubernetesCluster } from "../catalog-entities";
import readDirectoryInjectable from "../fs/read-directory.injectable";
import readFileInjectable from "../fs/read-file.injectable";
import createResourceStackInjectable from "../k8s/create-resource-stack.injectable";
import appPathsStateInjectable from "../app-paths/app-paths-state.injectable";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";

describe("create resource stack tests", () => {
  let di: DiContainer;
  let cluster: KubernetesCluster;

  beforeEach(async () => {
    di = getDiForUnitTesting();
    cluster = {
      getId: () => "test-cluster",
    } as any;

    di.override(readDirectoryInjectable, () => () => Promise.resolve(["file1"]) as any);
    di.override(readFileInjectable, () => () => Promise.resolve("filecontents"));
    di.override(appPathsStateInjectable, () => ({
      get: () => ({}),
    }));
    di.override(directoryForUserDataInjectable, () => "/some-directory-for-user-data");
  
  });

  describe("kubectlApplyFolder", () => {
    it("returns response", async () => {
      di.override(kubectlApplyAllInjectable, () => () => Promise.resolve({
        callWasSuccessful: true as const,
        response: "success",
      }));

      const createResourceStack = di.inject(createResourceStackInjectable);
      const resourceStack = createResourceStack(cluster, "test");

      const response = await resourceStack.kubectlApplyFolder("/foo/bar");

      expect(response).toEqual("success");
    });

    it("throws on error", async () => {
      di.override(kubectlApplyAllInjectable, () => () => Promise.resolve({
        callWasSuccessful: false as const,
        error: "No permissions",
      }));

      const createResourceStack = di.inject(createResourceStackInjectable);
      const resourceStack = createResourceStack(cluster, "test");

      await expect(() => resourceStack.kubectlApplyFolder("/foo/bar")).rejects.toThrow("No permissions");
    });
  });
});
