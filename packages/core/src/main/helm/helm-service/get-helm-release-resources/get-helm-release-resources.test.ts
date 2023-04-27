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
import type { ExecFileWithInput } from "./call-for-kube-resources-by-manifest/exec-file-with-input/exec-file-with-input.injectable";
import execFileWithInputInjectable from "./call-for-kube-resources-by-manifest/exec-file-with-input/exec-file-with-input.injectable";
import type { AsyncResult } from "@k8slens/utilities";
import type { KubeJsonApiData } from "@k8slens/kube-object";

describe("get helm release resources", () => {
  let getHelmReleaseResources: GetHelmReleaseResources;
  let execHelmMock: AsyncFnMock<ExecHelm>;
  let execFileWithStreamInputMock: AsyncFnMock<ExecFileWithInput>;

  beforeEach(() => {
    const di = getDiForUnitTesting();

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
    let actualPromise: AsyncResult<KubeJsonApiData[], string>;

    beforeEach(() => {
      actualPromise = getHelmReleaseResources(
        "some-release",
        "some-namespace",
        "/some-kubeconfig-path",
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

      expect(actual).toEqual({
        callWasSuccessful: true,
        response: [],
      });
    });

    it("when call to manifest resolves with resources, resolves with resources", async () => {
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
kind: SomeOtherKind
metadata:
  name: some-resource-without-namespace
---
apiVersion: v1
kind: List
items:
  - apiVersion: monitoring.coreos.com/v1
    kind: ServiceMonitor
    metadata:
      name: collection-sumologic-fluentd-logs
      namespace: some-namespace
---
apiVersion: v1
kind: SomeKind
metadata:
  name: some-resource-with-different-namespace
  namespace: some-other-namespace
---
`,
      });

      expect(await actualPromise).toEqual({
        callWasSuccessful: true,
        response: [
          {
            apiVersion: "v1",
            kind: "SomeKind",
            metadata: {
              name: "some-resource-with-same-namespace",
              namespace: "some-namespace",
            },
          },
          {
            apiVersion: "v1",
            kind: "SomeOtherKind",
            metadata: {
              name: "some-resource-without-namespace",
            },
          },
          {
            apiVersion: "monitoring.coreos.com/v1",
            kind: "ServiceMonitor",
            metadata: {
              name: "collection-sumologic-fluentd-logs",
              namespace: "some-namespace",
            },
          },
          {
            apiVersion: "v1",
            kind: "SomeKind",
            metadata: {
              name: "some-resource-with-different-namespace",
              namespace: "some-other-namespace",
            },
          },
        ],
      });
    });
  });
});
