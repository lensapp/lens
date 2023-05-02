/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AuthorizationV1Api } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import type { KubeApiResource } from "../rbac";

export type CanListResource = (resource: KubeApiResource) => boolean;

/**
 * Requests the permissions for actions on the kube cluster
 * @param namespace The namespace of the resources
 */
export type RequestNamespaceListPermissions = (namespace: string) => Promise<CanListResource>;

export type CreateRequestNamespaceListPermissions = (api: AuthorizationV1Api) => RequestNamespaceListPermissions;

const createRequestNamespaceListPermissionsInjectable = getInjectable({
  id: "create-request-namespace-list-permissions",
  instantiate: (di): CreateRequestNamespaceListPermissions => {
    const logger = di.inject(loggerInjectionToken);

    return (api) => async (namespace) => {
      try {
        const { body: { status }} = await api.createSelfSubjectRulesReview({
          apiVersion: "authorization.k8s.io/v1",
          kind: "SelfSubjectRulesReview",
          spec: { namespace },
        });

        if (!status || status.incomplete) {
          logger.warn(`[AUTHORIZATION-NAMESPACE-REVIEW]: allowing all resources in namespace="${namespace}" due to incomplete SelfSubjectRulesReview: ${status?.evaluationError}`);

          return () => true;
        }

        const { resourceRules } = status;

        return (resource) => (
          resourceRules
            .filter(({ apiGroups = ["*"] }) => apiGroups.includes("*") || apiGroups.includes(resource.group))
            .filter(({ resources = ["*"] }) => resources.includes("*") || resources.includes(resource.apiName))
            .some(({ verbs }) => verbs.includes("*") || verbs.includes("list"))
        );
      } catch (error) {
        logger.error(`[AUTHORIZATION-NAMESPACE-REVIEW]: failed to create subject rules review`, { namespace, error });

        return () => true;
      }
    };
  },
});

export default createRequestNamespaceListPermissionsInjectable;
