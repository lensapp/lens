/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import styles from "./webhook-config.module.css";
import type { Webhook } from "@k8slens/kube-object";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";

interface WebhookProps {
  webhook: Webhook;
}

export const WebhookConfig: React.FC<WebhookProps> = ({ webhook }) => {
  return (
    <>
      <DrawerItem name="Name" className={styles.firstItem}>
        <strong>{webhook.name}</strong>
      </DrawerItem>
      <DrawerItem name="Client Config">
        {webhook.clientConfig?.service?.name && (
          <div>
            <div>
              Name:
              {" "}
              {webhook.clientConfig.service.name}
            </div>
            <div>
              Namespace:
              {" "}
              {webhook.clientConfig.service.namespace}
            </div>
          </div>
        )}
      </DrawerItem>
      <DrawerItem name="Match Policy">
        {webhook.matchPolicy}
      </DrawerItem>
      <DrawerItem name="Failure Policy">
        {webhook.failurePolicy}
      </DrawerItem>
      <DrawerItem name="Admission Review Versions">
        {webhook.admissionReviewVersions?.join(", ")}
      </DrawerItem>
      { webhook.reinvocationPolicy && (
        <DrawerItem name="Reinvocation Policy">
          {webhook.reinvocationPolicy}
        </DrawerItem>
      )}
      <DrawerItem name="Side Effects">
        {webhook.sideEffects}
      </DrawerItem>
      <DrawerItem name="Timeout Seconds">
        {webhook.timeoutSeconds}
      </DrawerItem>
      <DrawerItem name="Namespace Selector">
        {webhook.namespaceSelector && (
          <div>
            <div>Match Expressions:</div>
            {webhook.namespaceSelector.matchExpressions?.map((expression, index) => (
              <div key={index}>
                <div>
                  Key:
                  {" "}
                  {expression.key}
                </div>
                <div>
                  Operator:
                  {" "}
                  {expression.operator}
                </div>
                <div>
                  Values:
                  {" "}
                  {expression.values?.join(", ")}
                </div>
              </div>
            ))}
            {webhook.namespaceSelector.matchLabels && (
              <div>
                <div>Match Labels:</div>
                <div className={styles.matchLabels}>
                  {Object.entries(webhook.namespaceSelector.matchLabels).map(([key, value], index) => (
                    <Badge label={`${key}=${value ?? ""}`} key={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DrawerItem>
      <DrawerItem name="Object Selector">
        {webhook.objectSelector && (
          <div>
            <div>Match Expressions:</div>
            {webhook.objectSelector.matchExpressions?.map((expression, index) => (
              <div key={index}>
                <div>
                  Key:
                  {" "}
                  {expression.key}
                </div>
                <div>
                  Operator:
                  {" "}
                  {expression.operator}
                </div>
                <div>
                  Values:
                  {" "}
                  {expression.values?.join(", ")}
                </div>
              </div>
            ))}
            {webhook.objectSelector.matchLabels && (
              <div>
                <div>Match Labels:</div>
                <div className={styles.matchLabels}>
                  {Object.entries(webhook.objectSelector.matchLabels).map(([key, value], index) => (
                    <Badge label={`${key}=${value ?? ""}`} key={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DrawerItem>
      <DrawerItem name="Rules" className={styles.lastItem}>
        {webhook.rules?.map((rule, index) => (
          <div key={index}>
            <div>
              API Groups:
              {" "}
              {rule.apiGroups.join(", ")}
            </div>
            <div>
              API Versions:
              {" "}
              {rule.apiVersions?.join(", ")}
            </div>
            <div>
              Operations:
              {" "}
              {rule.operations.join(", ")}
            </div>
            {rule.resources && (
              <div>
                Resources:
                {" "}
                {rule.resources.join(", ")}
              </div>
            )}
            {rule.scope && (
              <div>
                Scope:
                {" "}
                {rule.scope}
              </div>
            )}
          </div>
        ))}
      </DrawerItem>
    </>
  );
};
