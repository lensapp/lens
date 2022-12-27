/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeConfig } from "@kubernetes/client-node";
import { AuthorizationV1Api } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../logger.injectable";
import type { KubeApiResource } from "../rbac";

export type CanListResource = (resource: KubeApiResource) => boolean;

/**
 * Requests the permissions for actions on the kube cluster
 * @param namespace The namespace of the resources
 */
export type RequestNamespaceListPermissions = (namespace: string) => Promise<CanListResource>;

/**
 * @param proxyConfig This config's `currentContext` field must be set, and will be used as the target cluster
 */
export type RequestNamespaceListPermissionsFor = (proxyConfig: KubeConfig) => RequestNamespaceListPermissions;

const requestNamespaceListPermissionsForInjectable = getInjectable({
  id: "request-namespace-list-permissions-for",
  instantiate: (di): RequestNamespaceListPermissionsFor => {
    const logger = di.inject(loggerInjectable);

    return (proxyConfig) => {
      const api = proxyConfig.makeApiClient(AuthorizationV1Api);

      return async (namespace) => {
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

          return (resource) => {
            const resourceRule = resourceRules.find(({
              apiGroups = [],
              resources = [],
            }) => {
              const isAboutRelevantApiGroup = apiGroups.includes("*") || apiGroups.includes(resource.group);
              const isAboutResource = resources.includes("*") || resources.includes(resource.apiName);

              return isAboutRelevantApiGroup && isAboutResource;
            });

            if (!resourceRule) {
              return false;
            }

            const { verbs } = resourceRule;

            return verbs.includes("*") || verbs.includes("list");
          };
        } catch (error) {
          logger.error(`[AUTHORIZATION-NAMESPACE-REVIEW]: failed to create subject rules review`, { namespace, error });

          return () => true;
        }
      };
    };
  },
});

export default requestNamespaceListPermissionsForInjectable;
