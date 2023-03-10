/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { AuthorizationV1Api, V1SubjectRulesReviewStatus } from "@kubernetes/client-node";
import type { DiContainer } from "@ogre-tools/injectable";
import type { IncomingMessage } from "http";
import { anyObject } from "jest-mock-extended";
import { getDiForUnitTesting } from "../../main/getDiForUnitTesting";
import { cast } from "../../test-utils/cast";
import type { KubeApiResource } from "../rbac";
import type { RequestNamespaceListPermissions } from "./create-request-namespace-list-permissions.injectable";
import createRequestNamespaceListPermissionsInjectable from "./create-request-namespace-list-permissions.injectable";

interface TestCase {
  description: string;
  status: V1SubjectRulesReviewStatus;
  expected: boolean;
}

describe("requestNamespaceListPermissions", () => {
  let di: DiContainer;
  let createSelfSubjectRulesReviewMock: AsyncFnMock<AuthorizationV1Api["createSelfSubjectRulesReview"]>;
  let requestNamespaceListPermissions: RequestNamespaceListPermissions;

  beforeEach(() => {
    di = getDiForUnitTesting();

    const createRequestNamespaceListPermissions = di.inject(createRequestNamespaceListPermissionsInjectable);

    createSelfSubjectRulesReviewMock = asyncFn();

    requestNamespaceListPermissions = createRequestNamespaceListPermissions(cast<AuthorizationV1Api>({
      createSelfSubjectRulesReview: createSelfSubjectRulesReviewMock,
    }));
  });

  describe("when a request for list permissions in a namespace has been started", () => {
    let request: ReturnType<RequestNamespaceListPermissions>;

    beforeEach(() => {
      request = requestNamespaceListPermissions("irrelevant-namespace");
    });

    it("should request the creation of a SelfSubjectRulesReview", () => {
      expect(createSelfSubjectRulesReviewMock).toBeCalledWith(anyObject({
        spec: {
          namespace: "irrelevant-namespace",
        },
      }));
    });

    ([
      {
        description: "incomplete data",
        status: {
          incomplete: true,
          resourceRules: [],
          nonResourceRules: [],
        },
        expected: true,
      },
      {
        description: "first resourceRule has all permissions for everything",
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
        expected: true,
      },
      {
        description: "first resourceRule has list permissions for everything",
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
        expected: true,
      },
      {
        description: "first resourceRule has list permissions for asked resource",
        status: {
          incomplete: false,
          resourceRules: [
            {
              apiGroups: ["some-api-group"],
              resources: ["some-kind"],
              verbs: ["list"],
            },
            {
              apiGroups: ["*"],
              verbs: ["get"],
            },
          ],
          nonResourceRules: [],
        },
        expected: true,
      },
      {
        description: "last resourceRule has all permissions for everything",
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
        expected: true,
      },
      {
        description: "last resourceRule has list permissions for asked resource",
        status: {
          incomplete: false,
          resourceRules: [
            {
              apiGroups: ["*"],
              verbs: ["get"],
            },
            {
              apiGroups: ["some-api-group"],
              resources: ["some-kind"],
              verbs: ["list"],
            },
          ],
          nonResourceRules: [],
        },
        expected: true,
      },
      {
        description: "resourceRules has matching resource without list verb",
        status: {
          incomplete: false,
          resourceRules: [
            {
              apiGroups: ["some-api-group"],
              resources: ["some-kind"],
              verbs: ["get"],
            },
          ],
          nonResourceRules: [],
        },
        expected: false,
      },
      {
        description: "resourceRules has no matching resource with list verb",
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
        expected: false,
      },
    ] as TestCase[]).forEach(({ description, status, expected }) => {
      describe(`when api returns ${description}`, () => {
        beforeEach(async () => {
          await createSelfSubjectRulesReviewMock.resolve({
            body: {
              status,
              spec: {},
            },
            response: null as unknown as IncomingMessage,
          });
        });

        it(`allows the request to complete, and 'canListResource' will return ${expected}`, async () => {
          const canListResource = await request;

          expect(canListResource(someKubeResource)).toBe(expected);
        });
      });
    });

    describe("when api rejects", () => {
      beforeEach(async () => {
        await createSelfSubjectRulesReviewMock.reject(new Error("unknown error"));
      });

      it("allows the request to complete, and 'canListResource' will return true", async () => {
        const canListResource = await request;

        expect(canListResource(someKubeResource)).toBe(true);
      });
    });
  });
});

const someKubeResource: KubeApiResource = {
  apiName: "some-kind",
  group: "some-api-group",
  kind: "SomeKind",
  namespaced: true,
};
