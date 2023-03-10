/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeConfig, V1ResourceAttributes } from "@kubernetes/client-node";
import { AuthorizationV1Api } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../logger.injectable";

/**
 * Requests the permissions for actions on the kube cluster
 * @param resourceAttributes The descriptor of the action that is desired to be known if it is allowed
 * @returns `true` if the actions described are allowed
 */
export type CanI = (resourceAttributes: V1ResourceAttributes) => Promise<boolean>;

/**
 * @param proxyConfig This config's `currentContext` field must be set, and will be used as the target cluster
 */
export type CreateAuthorizationReview = (proxyConfig: KubeConfig) => CanI;

const createAuthorizationReviewInjectable = getInjectable({
  id: "authorization-review",
  instantiate: (di): CreateAuthorizationReview => {
    const logger = di.inject(loggerInjectable);

    return (proxyConfig) => {
      const api = proxyConfig.makeApiClient(AuthorizationV1Api);

      return async (resourceAttributes: V1ResourceAttributes): Promise<boolean> => {
        try {
          const { body } = await api.createSelfSubjectAccessReview({
            apiVersion: "authorization.k8s.io/v1",
            kind: "SelfSubjectAccessReview",
            spec: { resourceAttributes },
          });

          return body.status?.allowed ?? false;
        } catch (error) {
          logger.error(`[AUTHORIZATION-REVIEW]: failed to create access review: ${error}`, { resourceAttributes });

          return false;
        }
      };
    };
  },
});

export default createAuthorizationReviewInjectable;
