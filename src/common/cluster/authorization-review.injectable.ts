/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { AuthorizationV1Api, KubeConfig, V1ResourceAttributes } from "@kubernetes/client-node";
import logger from "../logger";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";

export type CanI = (resourceAttributes: V1ResourceAttributes) => Promise<boolean>;

/**
 * @param proxyConfig This config's `currentContext` field must be set, and will be used as the target cluster
   */
export function authorizationReview(proxyConfig: KubeConfig): CanI {
  const api = proxyConfig.makeApiClient(AuthorizationV1Api);

  /**
   * Requests the permissions for actions on the kube cluster
   * @param resourceAttributes The descriptor of the action that is desired to be known if it is allowed
   * @returns `true` if the actions described are allowed
   */
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
}

const authorizationReviewInjectable = getInjectable({
  instantiate: () => authorizationReview,
  lifecycle: lifecycleEnum.singleton,
});

export default authorizationReviewInjectable;
