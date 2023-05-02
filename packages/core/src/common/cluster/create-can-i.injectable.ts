/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AuthorizationV1Api, V1ResourceAttributes } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";

/**
 * Requests the permissions for actions on the kube cluster
 * @param resourceAttributes The descriptor of the action that is desired to be known if it is allowed
 * @returns `true` if the actions described are allowed
 */
export type CanI = (resourceAttributes: V1ResourceAttributes) => Promise<boolean>;

export type CreateCanI = (api: AuthorizationV1Api) => CanI;

const createCanIInjectable = getInjectable({
  id: "create-can-i",
  instantiate: (di): CreateCanI => {
    const logger = di.inject(loggerInjectionToken);

    return (api) => async (resourceAttributes: V1ResourceAttributes): Promise<boolean> => {
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
  },
});

export default createCanIInjectable;
