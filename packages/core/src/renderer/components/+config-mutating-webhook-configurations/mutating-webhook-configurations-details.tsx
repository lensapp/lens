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
      </div >
    );
  }
}
