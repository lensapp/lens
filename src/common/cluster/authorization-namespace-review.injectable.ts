/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeConfig } from "@kubernetes/client-node";
import { AuthorizationV1Api } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import type { Logger } from "../logger";
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

interface Dependencies { 
  logger: Logger;
}

const authorizationNamespaceReview = ({ logger }: Dependencies): AuthorizationNamespaceReview => {
  return (proxyConfig) => {

    const api = proxyConfig.makeApiClient(AuthorizationV1Api);

    return async (namespace, availableResources) => {
      try {
        const { body } = await api.createSelfSubjectRulesReview({
          apiVersion: "authorization.k8s.io/v1",
          kind: "SelfSubjectRulesReview",
          spec: { namespace },
        });

        const resources = new Set<string>();

        body.status?.resourceRules.forEach(resourceRule => {
          if (!resourceRule.verbs.some(verb => ["*", "list"].includes(verb)) || !resourceRule.resources) {
            return;
          }

          const apiGroups = resourceRule.apiGroups;

          if (resourceRule.resources.length === 1 && resourceRule.resources[0] === "*" && apiGroups) {
            if (apiGroups[0] === "*") {
              availableResources.forEach(resource => resources.add(resource.apiName));
            } else {
              availableResources.forEach((apiResource)=> {
                if (apiGroups.includes(apiResource.group || "")) {
                  resources.add(apiResource.apiName);
                }
              });
            }
          } else {
            resourceRule.resources.forEach(resource => resources.add(resource));
          }
          
        });

        return [...resources];
      } catch (error) {
        logger.error(`[AUTHORIZATION-NAMESPACE-REVIEW]: failed to create subject rules review: ${error}`, { namespace });

        return [];
      }
    };
  };
};

const authorizationNamespaceReviewInjectable = getInjectable({
  id: "authorization-namespace-review",
  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);

    return authorizationNamespaceReview({ logger });
  },
});

export default authorizationNamespaceReviewInjectable;
