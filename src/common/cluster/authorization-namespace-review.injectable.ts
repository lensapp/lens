/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeConfig } from "@kubernetes/client-node";
import { AuthorizationV1Api } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import type { Logger } from "../logger";
import loggerInjectable from "../logger.injectable";

export type RequestNamespaceResources = (namespace: string) => Promise<string[]>; 

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

    /**
     * Requests the permissions for actions on the kube cluster
     * @param namespace The namespace of the resources
     * @returns list of allowed resources
     */
    return async (namespace: string): Promise<string[]> => {
      try {
        const { body } = await api.createSelfSubjectRulesReview({
          apiVersion: "authorization.k8s.io/v1",
          kind: "SelfSubjectRulesReview",
          spec: { namespace },
        });

        const resources = new Set<string>();

        body.status?.resourceRules.forEach(resourceRule => {
          if (resourceRule.verbs.some(verb => ["*", "list"].includes(verb))) {
            resourceRule.resources?.forEach(resource => resources.add(resource));
          }
        });

        resources.delete("*");

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
