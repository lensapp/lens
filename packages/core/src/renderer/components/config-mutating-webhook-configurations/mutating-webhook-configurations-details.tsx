/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import type { MutatingWebhookConfiguration } from "@k8slens/kube-object";
import { WebhookConfig } from "./webhook-config";

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
        {webhookConfig.getWebhooks()?.length == 0 && (
          <div style={{ opacity: 0.6 }}>No webhooks set</div>
        )}
        {webhookConfig.getWebhooks()?.map((webhook) => (
          <WebhookConfig webhook={webhook} key={webhook.name} />
        ))}
      </div >
    );
  }
}
