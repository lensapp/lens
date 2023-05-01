/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { WebhookConfig } from "../config-mutating-webhook-configurations/webhook-config";
import { ValidatingWebhookConfiguration } from "@k8slens/kube-object";

@observer
export class ValidatingWebhookDetails extends React.Component<KubeObjectDetailsProps> {
  render() {
    const { object: webhookConfig } = this.props;

    if (!webhookConfig) {
      return null;
    }

    if (!(webhookConfig instanceof ValidatingWebhookConfiguration)) {
      return null;
    }

    return (
      <div className="ValidatingWebhookDetails">
        <DrawerItem name="API version">
          {webhookConfig.apiVersion}
        </DrawerItem>
        <DrawerTitle>Webhooks</DrawerTitle>
        {webhookConfig.getWebhooks()?.length == 0 && (
          <div style={{ opacity: 0.6 }}>No webhooks set</div>
        )}
        {webhookConfig.getWebhooks()?.map((webhook) => (
          <WebhookConfig webhook={webhook} key={webhook.name} />
        ))}
      </div>
    );
  }
}
