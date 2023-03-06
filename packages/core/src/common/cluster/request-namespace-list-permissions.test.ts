/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { V1SubjectRulesReviewStatus } from "@kubernetes/client-node";
import type { DiContainer } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../main/getDiForUnitTesting";
import type { RequestNamespaceListPermissionsFor } from "./request-namespace-list-permissions.injectable";
import requestNamespaceListPermissionsForInjectable from "./request-namespace-list-permissions.injectable";

const createFakeProxyConfig = (statusResponse: Promise<{ body: { status: V1SubjectRulesReviewStatus }}>) => ({
  makeApiClient: () => ({
    createSelfSubjectRulesReview: (): Promise<{ body: { status: V1SubjectRulesReviewStatus }}> => statusResponse,
  }),
});

describe("requestNamespaceListPermissions", () => {
  let di: DiContainer;
  let requestNamespaceListPermissions: RequestNamespaceListPermissionsFor;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
    requestNamespaceListPermissions = di.inject(requestNamespaceListPermissionsForInjectable);
  });

  describe("when api returns incomplete data", () => {
    it("returns truthy function", async () => {
      const requestPermissions = requestNamespaceListPermissions(createFakeProxyConfig(
        new Promise((resolve) => resolve({
          body: {
            status: {
              incomplete: true,
              resourceRules: [],
              nonResourceRules: [],
            },
          },
        })),
      ) as any);

      const permissionCheck = await requestPermissions("fake-namespace");

      expect(permissionCheck({
        apiName: "pods",
        group: "",
        kind: "Pod",
        namespaced: true,
      })).toBeTruthy();
    });
  });

  describe("when api rejects", () => {
    it("returns truthy function", async () => {
      const requestPermissions = requestNamespaceListPermissions(createFakeProxyConfig(
        new Promise((resolve, reject) => reject("unknown error")),
      ) as any);

      const permissionCheck = await requestPermissions("fake-namespace");

      expect(permissionCheck({
        apiName: "pods",
        group: "",
        kind: "Pod",
        namespaced: true,
      })).toBeTruthy();
    });
  });

  describe("when first resourceRule has all permissions for everything", () => {
    it("return truthy function", async () => {
      const requestPermissions = requestNamespaceListPermissions(createFakeProxyConfig(
        new Promise((resolve) => resolve({
          body: {
            status: {
              incomplete: false,
              resourceRules: [
                {
                  apiGroups: ["*"],
                  verbs: ["*"],
                },
                {
                  apiGroups: ["*"],
                  verbs: ["get"],
                },
              ],
              nonResourceRules: [],
            },
          },
        })),
      ) as any);

      const permissionCheck = await requestPermissions("fake-namespace");

      expect(permissionCheck({
        apiName: "pods",
        group: "",
        kind: "Pod",
        namespaced: true,
      })).toBeTruthy();
    });
  });

  describe("when first resourceRule has list permissions for everything", () => {
    it("return truthy function", async () => {
      const requestPermissions = requestNamespaceListPermissions(createFakeProxyConfig(
        new Promise((resolve) => resolve({
          body: {
            status: {
              incomplete: false,
              resourceRules: [
                {
                  apiGroups: ["*"],
                  verbs: ["list"],
                },
                {
                  apiGroups: ["*"],
                  verbs: ["get"],
                },
              ],
              nonResourceRules: [],
            },
          },
        })),
      ) as any);

      const permissionCheck = await requestPermissions("fake-namespace");

      expect(permissionCheck({
        apiName: "pods",
        group: "",
        kind: "Pod",
        namespaced: true,
      })).toBeTruthy();
    });
  });

  describe("when first resourceRule has list permissions for asked resource", () => {
    it("return truthy function", async () => {
      const requestPermissions = requestNamespaceListPermissions(createFakeProxyConfig(
        new Promise((resolve) => resolve({
          body: {
            status: {
              incomplete: false,
              resourceRules: [
                {
                  apiGroups: [""],
                  resources: ["pods"],
                  verbs: ["list"],
                },
                {
                  apiGroups: ["*"],
                  verbs: ["get"],
                },
              ],
              nonResourceRules: [],
            },
          },
        })),
      ) as any);

      const permissionCheck = await requestPermissions("fake-namespace");

      expect(permissionCheck({
        apiName: "pods",
        group: "",
        kind: "Pod",
        namespaced: true,
      })).toBeTruthy();
    });
  });

  describe("when last resourceRule has all permissions for everything", () => {
    it("return truthy function", async () => {
      const requestPermissions = requestNamespaceListPermissions(createFakeProxyConfig(
        new Promise((resolve) => resolve({
          body: {
            status: {
              incomplete: false,
              resourceRules: [
                {
                  apiGroups: ["*"],
                  verbs: ["get"],
                },
                {
                  apiGroups: ["*"],
                  verbs: ["*"],
                },
              ],
              nonResourceRules: [],
            },
          },
        })),
      ) as any);

      const permissionCheck = await requestPermissions("fake-namespace");

      expect(permissionCheck({
        apiName: "pods",
        group: "",
        kind: "Pod",
        namespaced: true,
      })).toBeTruthy();
    });
  });

  describe("when last resourceRule has list permissions for everything", () => {
    it("return truthy function", async () => {
      const requestPermissions = requestNamespaceListPermissions(createFakeProxyConfig(
        new Promise((resolve) => resolve({
          body: {
            status: {
              incomplete: false,
              resourceRules: [
                {
                  apiGroups: ["*"],
                  verbs: ["get"],
                },
                {
                  apiGroups: ["*"],
                  verbs: ["list"],
                },
              ],
              nonResourceRules: [],
            },
          },
        })),
      ) as any);

      const permissionCheck = await requestPermissions("fake-namespace");

      expect(permissionCheck({
        apiName: "pods",
        group: "",
        kind: "Pod",
        namespaced: true,
      })).toBeTruthy();
    });
  });

  describe("when last resourceRule has list permissions for asked resource", () => {
    it("return truthy function", async () => {
      const requestPermissions = requestNamespaceListPermissions(createFakeProxyConfig(
        new Promise((resolve) => resolve({
          body: {
            status: {
              incomplete: false,
              resourceRules: [
                {
                  apiGroups: ["*"],
                  verbs: ["get"],
                },
                {
                  apiGroups: [""],
                  resources: ["pods"],
                  verbs: ["list"],
                },
              ],
              nonResourceRules: [],
            },
          },
        })),
      ) as any);

      const permissionCheck = await requestPermissions("fake-namespace");

      expect(permissionCheck({
        apiName: "pods",
        group: "",
        kind: "Pod",
        namespaced: true,
      })).toBeTruthy();
    });
  });

  describe("when resourceRules has matching resource without list verb", () => {
    it("return truthy function", async () => {
      const requestPermissions = requestNamespaceListPermissions(createFakeProxyConfig(
        new Promise((resolve) => resolve({
          body: {
            status: {
              incomplete: false,
              resourceRules: [
                {
                  apiGroups: [""],
                  resources: ["pods"],
                  verbs: ["get"],
                },
              ],
              nonResourceRules: [],
            },
          },
        })),
      ) as any);

      const permissionCheck = await requestPermissions("fake-namespace");

      expect(permissionCheck({
        apiName: "pods",
        group: "",
        kind: "Pod",
        namespaced: true,
      })).toBeFalsy();
    });
  });

  describe("when resourceRules has no matching resource with list verb", () => {
    it("return truthy function", async () => {
      const requestPermissions = requestNamespaceListPermissions(createFakeProxyConfig(
        new Promise((resolve) => resolve({
          body: {
            status: {
              incomplete: false,
              resourceRules: [
                {
                  apiGroups: [""],
                  resources: ["services"],
                  verbs: ["list"],
                },
              ],
              nonResourceRules: [],
            },
          },
        })),
      ) as any);

      const permissionCheck = await requestPermissions("fake-namespace");

      expect(permissionCheck({
        apiName: "pods",
        group: "",
        kind: "Pod",
        namespaced: true,
      })).toBeFalsy();
    });
  });
});
