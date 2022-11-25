/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeConfig } from "@kubernetes/client-node";
import { AuthorizationV1Api } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../logger.injectable";
import type { KubeApiResource } from "../rbac";

/**
 * Requests the permissions for actions on the kube cluster
 * @param namespace The namespace of the resources
 * @param availableResources List of available resources in the cluster to resolve glob values fir api groups
 * @returns list of allowed resources names
 */
export type RequestNamespaceResources = (namespace: string, availableResources: KubeApiResource[]) => Promise<string[]>;

/**
 * @param proxyConfig This config's `currentContext` field must be set, and will be used as the target cluster
 */
export type AuthorizationNamespaceReview = (proxyConfig: KubeConfig) => RequestNamespaceResources;

const authorizationNamespaceReviewInjectable = getInjectable({
  id: "authorization-namespace-review",
  instantiate: (di): AuthorizationNamespaceReview => {
    const logger = di.inject(loggerInjectable);

    return (proxyConfig) => {
      const api = proxyConfig.makeApiClient(AuthorizationV1Api);

      return async (namespace, availableResources) => {
        try {
          const { body: { status }} = await api.createSelfSubjectRulesReview({
            apiVersion: "authorization.k8s.io/v1",
            kind: "SelfSubjectRulesReview",
            spec: { namespace },
          });

          const allowedResources = new Set<string>();

          if (!status || status.incomplete) {
            logger.warn(`[AUTHORIZATION-NAMESPACE-REVIEW]: allowing all resources in namespace="${namespace}" due to incomplete SelfSubjectRulesReview: ${status?.evaluationError}`);

            return availableResources.map(r => r.apiName);
          }

          for (const { verbs, resources, apiGroups } of status.resourceRules) {
            if (
              !resources
            || (!verbs.includes("*") && !verbs.includes("list"))
            ) {
              continue;
            }

            if (resources[0] !== "*" || !apiGroups) {
              for (const resource of resources) {
                allowedResources.add(resource);
              }
              continue;
            }

            if (apiGroups[0] === "*") {
              for (const resource of availableResources) {
                allowedResources.add(resource.apiName);
              }
              continue;
            }

            for (const resource of availableResources) {
              if (apiGroups.includes(resource.group || "")) {
                allowedResources.add(resource.apiName);
              }
            }
          }

          return [...allowedResources];
        } catch (error) {
          logger.error(`[AUTHORIZATION-NAMESPACE-REVIEW]: failed to create subject rules review: ${error}`, { namespace });

          return [];
        }
      };
    };
  },
});

export default authorizationNamespaceReviewInjectable;
