/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import type { ChildProcess } from "child_process";
import path from "path";
import directoryForKubeConfigsInjectable from "../../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import createAuthorizationReviewInjectable from "../../../../common/cluster/authorization-review.injectable";
import createListNamespacesInjectable from "../../../../common/cluster/list-namespaces.injectable";
import type { RemoveDir } from "../../../../common/fs/remove.injectable";
import removeDirInjectable from "../../../../common/fs/remove.injectable";
import tempDirInjectable from "../../../../common/fs/temp-dir.injectable";
import tempFileInjectable from "../../../../common/fs/temp-file.injectable";
import type { Unlink } from "../../../../common/fs/unlink.injectable";
import unlinkInjectable from "../../../../common/fs/unlink.injectable";
import type { WriteFile } from "../../../../common/fs/write-file.injectable";
import writeFileInjectable from "../../../../common/fs/write-file.injectable";
import { expectInSetOnce } from "../../../../test-utils/expects";
import type { ExecFile } from "../../../child-process/exec-file.injectable";
import execFileInjectable from "../../../child-process/exec-file.injectable";
import createContextHandlerInjectable from "../../../context-handler/create-context-handler.injectable";
import createClusterInjectable from "../../../create-cluster/create-cluster.injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import createKubeconfigManagerInjectable from "../../../kubeconfig-manager/create-kubeconfig-manager.injectable";
import type { KubeconfigManager } from "../../../kubeconfig-manager/kubeconfig-manager";
import createKubectlInjectable from "../../../kubectl/create-kubectl.injectable";
import type { Kubectl } from "../../../kubectl/kubectl";
import type { K8sResourceApplier } from "../applier";
import createK8sResourceApplierInjectable from "../create.injectable";

describe("ResourceApplier", () => {
  let di: DiContainer;
  let writeFile: jest.MockedFunction<WriteFile>;
  let execFile: jest.MockedFunction<ExecFile>;
  let unlink: jest.MockedFunction<Unlink>;
  let removeDir: jest.MockedFunction<RemoveDir>;
  let resourceApplier: K8sResourceApplier;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(createKubectlInjectable, () => jest.fn().mockImplementation((): Partial<Kubectl> => ({
      ensureKubectl: jest.fn(),
      getPath: () => Promise.resolve("some-path"),
    })));
    di.override(directoryForKubeConfigsInjectable, () => "some/path");
    di.override(createKubeconfigManagerInjectable, () => jest.fn().mockImplementation((): Partial<KubeconfigManager> => ({
      getPath: () => Promise.resolve("some-proxy-path"),
    })));
    di.override(createContextHandlerInjectable, () => jest.fn());
    di.override(createAuthorizationReviewInjectable, () => jest.fn());
    di.override(createListNamespacesInjectable, () => jest.fn());
    di.override(writeFileInjectable, () => writeFile = jest.fn());
    di.override(execFileInjectable, () => execFile = jest.fn());
    di.override(unlinkInjectable, () => unlink = jest.fn());
    di.override(removeDirInjectable, () => removeDir = jest.fn());
    di.override(tempDirInjectable, () => jest.fn().mockImplementation(() => "some/temp/dir"));
    di.override(tempFileInjectable, () => jest.fn().mockImplementation(() => "some/temp/file"));

    const createK8sResourceApplier = di.inject(createK8sResourceApplierInjectable);
    const createCluster = di.inject(createClusterInjectable);

    resourceApplier = createK8sResourceApplier(createCluster({
      contextName: "some-context",
      id: "some-id",
      kubeConfigPath: "some/path/config",
    }, {
      clusterServerUrl: "some-server-url",
    }));
  });

  describe(".apply()", () => {
    it("should call unlink, if writeFile rejects", async () => {
      writeFile.mockImplementation(() => {
        throw new Error("irrelavent");
      });

      await expect(resourceApplier.apply({})).rejects.toBeTruthy();
      expect(unlink).toBeCalledWith("some/temp/file");
    });

    it("should call unlink, if execFile rejects", async () => {
      execFile.mockImplementation(() => {
        throw new Error("irrelavent");
      });

      await expect(resourceApplier.apply({})).rejects.toBeTruthy();
      expect(unlink).toBeCalledWith("some/temp/file");
    });

    it("should call unlink, if everything passes", async () => {
      execFile.mockImplementation(() => Object.assign(
        Promise.resolve({
          stdout: "I am some output",
          stderr: "",
        }),
        {
          child: {} as ChildProcess,
        },
      ));

      await expect(resourceApplier.apply({})).resolves.toBeTruthy();
      expect(unlink).toBeCalledWith("some/temp/file");
    });

    it("should return the stdout of execFile", async () => {
      execFile.mockImplementation(() => Object.assign(
        Promise.resolve({
          stdout: "I am some output",
          stderr: "",
        }),
        {
          child: {} as ChildProcess,
        },
      ));

      expect(await resourceApplier.apply({})).toBe("I am some output");
    });

    it("should build up a correct set of arguments", async () => {
      execFile.mockImplementation((path, args) => {
        expect(args).toEqual([
          "apply",
          "--kubeconfig",
          "some-proxy-path",
          "-o",
          "json",
          "-f",
          "some/temp/file",
        ]);

        return Object.assign(
          Promise.resolve({
            stdout: "I am some output",
            stderr: "",
          }),
          {
            child: {} as ChildProcess,
          },
        );
      });

      await resourceApplier.apply({});
    });
  });

  describe(".kubectlApplyAll()", () => {
    it("should call removeDir, if any writeFile rejects", async () => {
      let count = 0;

      writeFile.mockImplementation(async () => {
        count += 1;

        if (count === 2) {
          throw new Error("irrelavent");
        }
      });

      await expect(resourceApplier.kubectlApplyAll(["foo", "bar"])).rejects.toBeTruthy();
      expect(removeDir).toBeCalledWith("some/temp/dir");
    });

    it("should call removeDir, if any execFile rejects", async () => {
      execFile.mockImplementation(() => {
        throw new Error("irrelavent");
      });

      await expect(resourceApplier.kubectlApplyAll(["foo", "bar"])).rejects.toBeTruthy();
      expect(removeDir).toBeCalledWith("some/temp/dir");
    });

    it("should call writeFile for each resource", async () => {
      const resources = new Set(["foo", "bar"]);
      const onlyOnce = expectInSetOnce(resources);

      writeFile.mockImplementation(async (filePath, contents) => {
        if (path.sep === "/") {
          expect(filePath).toMatch(/^some\/temp\/dir\/[0-9]+.yaml$/);
        } else {
          expect(filePath).toMatch(/^some\\temp\\dir\\[0-9]+.yaml$/);
        }
        onlyOnce(contents);
      });

      execFile.mockImplementation(() => {
        return Object.assign(
          Promise.resolve({
            stdout: "I am some output",
            stderr: "",
          }),
          {
            child: {} as ChildProcess,
          },
        );
      });

      await expect(resourceApplier.kubectlApplyAll([...resources])).resolves.toBeTruthy();
      expect(removeDir).toBeCalledWith("some/temp/dir");
      onlyOnce.allSatisfied();
    });

    it("should use resonable arguments", async () => {
      execFile.mockImplementation((path, args) => {
        expect(args).toEqual([
          "apply",
          "--kubeconfig",
          "some-proxy-path",
          "-o",
          "json",
          "-f",
          "some/temp/dir",
        ]);

        return Object.assign(
          Promise.resolve({
            stdout: "I am some output",
            stderr: "",
          }),
          {
            child: {} as ChildProcess,
          },
        );
      });

      await expect(resourceApplier.kubectlApplyAll(["foo", "bar"])).resolves.toBeTruthy();
      expect(removeDir).toBeCalledWith("some/temp/dir");
    });
  });
});
