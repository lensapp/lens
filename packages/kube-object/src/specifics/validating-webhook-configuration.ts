/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeJsonApiData, KubeObjectMetadata, KubeObjectScope, NamespaceScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";
import type { Webhook } from "./mutating-webhook-configuration";

export interface ValidatingWebhookConfigurationData
  extends KubeJsonApiData<KubeObjectMetadata<KubeObjectScope.Namespace>, void, void> {
  webhooks?: Webhook[];
}

export class ValidatingWebhookConfiguration extends KubeObject<NamespaceScopedMetadata, void, void> {
  static kind = "ValidatingWebhookConfiguration";

  static namespaced = false;

  static apiBase = "/apis/admissionregistration.k8s.io/v1/validatingwebhookconfigurations";

  webhooks?: Webhook[];

  constructor({ webhooks, ...rest }: ValidatingWebhookConfigurationData) {
    super(rest);
    this.webhooks = webhooks;
  }

  getWebhooks(): Webhook[] {
    return this.webhooks ?? [];
  }
}
