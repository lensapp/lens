/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import type { GetHelmReleaseResources } from "./get-helm-release-resources.injectable";
import getHelmReleaseResourcesInjectable from "./get-helm-release-resources.injectable";
import type { ExecHelm } from "../../exec-helm/exec-helm.injectable";
import execHelmInjectable from "../../exec-helm/exec-helm.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { JsonObject } from "type-fest";
import type { ExecFileWithInput } from "./call-for-kube-resources-by-manifest/exec-file-with-input/exec-file-with-input.injectable";
import execFileWithInputInjectable from "./call-for-kube-resources-by-manifest/exec-file-with-input/exec-file-with-input.injectable";

describe("get helm release resources", () => {
  let getHelmReleaseResources: GetHelmReleaseResources;
  let execHelmMock: AsyncFnMock<ExecHelm>;
  let execFileWithStreamInputMock: AsyncFnMock<ExecFileWithInput>;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    execHelmMock = asyncFn();
    execFileWithStreamInputMock = asyncFn();

    di.override(execHelmInjectable, () => execHelmMock);

    di.override(
      execFileWithInputInjectable,
      () => execFileWithStreamInputMock,
    );

    getHelmReleaseResources = di.inject(getHelmReleaseResourcesInjectable);
  });

  describe("when called", () => {
    let actualPromise: Promise<JsonObject[]>;

    beforeEach(() => {
      actualPromise = getHelmReleaseResources(
        "some-release",
        "some-namespace",
        "/some-kubeconfig-path",
        "/some-kubectl-path",
      );
    });

    it("calls for release manifest", () => {
      expect(execHelmMock).toHaveBeenCalledWith([
        "get", "manifest", "some-release", "--namespace", "some-namespace", "--kubeconfig", "/some-kubeconfig-path",
      ]);
    });

    it("does not call for resources yet", () => {
      expect(execFileWithStreamInputMock).not.toHaveBeenCalled();
    });

    it("when call for manifest resolves without resources, resolves without resources", async () => {
      await execHelmMock.resolve({
        callWasSuccessful: true,
        response: "",
      });

      const actual = await actualPromise;

      expect(actual).toEqual([]);
    });

    describe("when call for manifest resolves", () => {
      beforeEach(async () => {
        await execHelmMock.resolve({
          callWasSuccessful: true,
          response: `---
apiVersion: v1
kind: SomeKind
metadata:
  name: some-resource-with-same-namespace
  namespace: some-namespace
---
apiVersion: v1
kind: SomeKind
metadata:
  name: some-resource-without-namespace
---
apiVersion: v1
kind: SomeKind
metadata:
  name: some-resource-with-different-namespace
  namespace: some-other-namespace
---
`,
        });
      });

      it("calls for resources from each namespace separately using the manifest as input", () => {
        expect(execFileWithStreamInputMock.mock.calls).toEqual([
          [
            {
              filePath: "/some-kubectl-path",
              commandArguments: ["get", "--kubeconfig", "/some-kubeconfig-path", "-f", "-", "--namespace", "some-namespace", "--output", "json"],
              input: `---
apiVersion: v1
kind: SomeKind
metadata:
  name: some-resource-with-same-namespace
  namespace: some-namespace
---
apiVersion: v1
kind: SomeKind
metadata:
  name: some-resource-without-namespace
---
`,
            },
          ],

          [
            {
              filePath: "/some-kubectl-path",
              commandArguments: ["get", "--kubeconfig", "/some-kubeconfig-path", "-f", "-", "--namespace", "some-other-namespace", "--output", "json"],
              input: `---
apiVersion: v1
kind: SomeKind
metadata:
  name: some-resource-with-different-namespace
  namespace: some-other-namespace
---
`,
            },
          ],
        ]);
      });

      it("when all calls for resources resolve, resolves with combined result", async () => {
        await execFileWithStreamInputMock.resolveSpecific(
          ([{ commandArguments }]) =>
            commandArguments.includes("some-namespace"),
          {
            callWasSuccessful: true,

            response: JSON.stringify({
              items: [{ some: "item" }],

              kind: "List",

              metadata: {
                resourceVersion: "",
                selfLink: "",
              },
            }),
          },
        );

        await execFileWithStreamInputMock.resolveSpecific(
          ([{ commandArguments }]) =>
            commandArguments.includes("some-other-namespace"),
          {
            callWasSuccessful: true,

            response: JSON.stringify({
              items: [{ some: "other-item" }],

              kind: "List",

              metadata: {
                resourceVersion: "",
                selfLink: "",
              },
            }),
          },
        );

        const actual = await actualPromise;

        expect(actual).toEqual([{ some: "item" }, { some: "other-item" }]);
      });

      it("given some call fails, when all calls have finished, rejects with failure", async () => {
        await execFileWithStreamInputMock.resolveSpecific(
          ([{ commandArguments }]) =>
            commandArguments.includes("some-namespace"),

          {
            callWasSuccessful: true,

            response: JSON.stringify({
              items: [{ some: "item" }],

              kind: "List",

              metadata: {
                resourceVersion: "",
                selfLink: "",
              },
            }),
          },
        );

        execFileWithStreamInputMock.resolveSpecific(
          ([{ commandArguments }]) =>
            commandArguments.includes("some-other-namespace"),

          {
            callWasSuccessful: false,
            error: "some-error",
          },
        );

        return expect(actualPromise).rejects.toEqual(expect.any(Error));
      });
    });
  });
});
