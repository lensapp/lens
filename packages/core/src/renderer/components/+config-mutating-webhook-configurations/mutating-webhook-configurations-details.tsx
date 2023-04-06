/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import type { MutatingWebhookConfiguration } from "../../../common/k8s-api/endpoints";

export interface MutatingWebhookDetailsProps extends KubeObjectDetailsProps<MutatingWebhookConfiguration> {
}

@observer
export class MutatingWebhookDetails extends React.Component<MutatingWebhookDetailsProps> {
  render() {
    const { object: webhookConfig } = this.props;

    return (
      <div className="MutatingWebhookDetails">
        <DrawerItem name="API version">
          {webhookConfig.apiVersion}
        </DrawerItem>
        <DrawerTitle>Webhooks</DrawerTitle>
        {webhookConfig.getWebhooks()?.map((webhook) => (
          <React.Fragment key={webhook.name}>
            <DrawerItem name="Name">
              <strong>{webhook.name}</strong>
            </DrawerItem>
            <DrawerItem name="Client Config">
              {webhook.clientConfig?.service?.name && (
                <div>
                  <div>
                    Name:
                    {webhook.clientConfig.service.name}
                  </div>
                  <div>
                    Namespace:
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
            <DrawerItem name="Reinvocation Policy">
              {webhook.reinvocationPolicy}
            </DrawerItem>
            <DrawerItem name="Side Effects">
              {webhook.sideEffects}
            </DrawerItem>
            <DrawerItem name="Timeout Seconds">
              {webhook.timeoutSeconds}
            </DrawerItem>
          </React.Fragment>
        ))}
      </div >
    );
  }
}
