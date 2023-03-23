/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { V1APIGroupList } from "@kubernetes/client-node";
import type { DiContainer } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import type { K8sRequest } from "../k8s-request.injectable";
import k8sRequestInjectable from "../k8s-request.injectable";
import type { ApiVersionsRequester } from "./api-versions-requester";
import requestNonCoreApiVersionsInjectable from "./request-non-core-api-versions.injectable";

describe("requestNonCoreApiVersions", () => {
  let di: DiContainer;
  let k8sRequestMock: AsyncFnMock<K8sRequest>;
  let requestNonCoreApiVersions: ApiVersionsRequester;

  beforeEach(() => {
    di = getDiForUnitTesting();

    k8sRequestMock = asyncFn();
    di.override(k8sRequestInjectable, () => k8sRequestMock);

    requestNonCoreApiVersions = di.inject(requestNonCoreApiVersionsInjectable);
  });

  describe("when called", () => {
    let versionsRequest: ReturnType<ApiVersionsRequester["request"]>;

    beforeEach(() => {
      versionsRequest = requestNonCoreApiVersions.request({ id: "some-cluster-id" });
    });

    it("should request all api groups", () => {
      expect(k8sRequestMock).toBeCalledWith({ id: "some-cluster-id" }, "/apis");
    });

    describe("when api groups request resolves to empty", () => {
      beforeEach(async () => {
        await k8sRequestMock.resolve({ groups: [] } as V1APIGroupList);
      });

      it("should return empty list", async () => {
        expect(await versionsRequest).toEqual({
          callWasSuccessful: true,
          response: [],
        });
      });
    });

    describe("when api groups request resolves to single group", () => {
      beforeEach(async () => {
        await k8sRequestMock.resolve({ groups: [{
          name: "some-name",
          versions: [{
            groupVersion: "some-name/v1",
            version: "v1",
          }],
        }] } as V1APIGroupList);
      });

      it("should return single entry in list", async () => {
        expect(await versionsRequest).toEqual({
          callWasSuccessful: true,
          response: [{
            group: "some-name",
            path: "/apis/some-name/v1",
          }],
        });
      });
    });

    describe("when api groups request resolves to single group with multiple versions", () => {
      beforeEach(async () => {
        await k8sRequestMock.resolve({ groups: [{
          name: "some-name",
          versions: [
            {
              groupVersion: "some-name/v1",
              version: "v1",
            },
            {
              groupVersion: "some-name/v1beta1",
              version: "v1beta1",
            },
          ],
        }] } as V1APIGroupList);
      });

      it("should return multiple entries in list", async () => {
        expect(await versionsRequest).toEqual({
          callWasSuccessful: true,
          response: [
            {
              group: "some-name",
              path: "/apis/some-name/v1",
            },
            {
              group: "some-name",
              path: "/apis/some-name/v1beta1",
            },
          ],
        });
      });
    });

    describe("when api groups request resolves to multiple groups with multiple versions", () => {
      beforeEach(async () => {
        await k8sRequestMock.resolve({ groups: [
          {
            name: "some-name",
            versions: [
              {
                groupVersion: "some-name/v1",
                version: "v1",
              },
              {
                groupVersion: "some-name/v1beta1",
                version: "v1beta1",
              },
            ],
          },
          {
            name: "some-other-name.foo.com",
            versions: [
              {
                groupVersion: "some-other-name.foo.com/v1",
                version: "v1",
              },
              {
                groupVersion: "some-other-name.foo.com/v1beta1",
                version: "v1beta1",
              },
            ],
          },
        ] } as V1APIGroupList);
      });

      it("should return multiple entries in list", async () => {
        expect(await versionsRequest).toEqual({
          callWasSuccessful: true,
          response: [
            {
              group: "some-name",
              path: "/apis/some-name/v1",
            },
            {
              group: "some-name",
              path: "/apis/some-name/v1beta1",
            },
            {
              group: "some-other-name.foo.com",
              path: "/apis/some-other-name.foo.com/v1",
            },
            {
              group: "some-other-name.foo.com",
              path: "/apis/some-other-name.foo.com/v1beta1",
            },
          ],
        });
      });
    });
  });
});
