/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { NamespaceScopedMetadata, KubeObjectMetadata, KubeObjectScope } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { DerivedKubeApiOptions, KubeApiDependencies } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { Webhook } from "./mutating-webhook-configuration.api";

export interface ValidatingWebhook extends Webhook {
}

interface ValidatingWebhookConfigurationData extends KubeJsonApiData<KubeObjectMetadata<KubeObjectScope.Namespace>, void, void> {
  webhooks?: ValidatingWebhook[];
}

export class ValidatingWebhookConfiguration extends KubeObject<
  NamespaceScopedMetadata,
  void,
  void
> {
  static kind = "ValidatingWebhookConfiguration";
  static namespaced = false;
  static apiBase = "/apis/admissionregistration.k8s.io/v1/validatingwebhookconfigurations";

  webhooks?: ValidatingWebhook[];

  constructor({ webhooks, ...rest }: ValidatingWebhookConfigurationData) {
    super(rest);
    this.webhooks = webhooks;
  }

  getWebhooks(): ValidatingWebhook[] {
    return this.webhooks ?? [];
  }
}

export class ValidatingWebhookConfigurationApi extends KubeApi<ValidatingWebhookConfiguration> {
  constructor(deps: KubeApiDependencies, opts?: DerivedKubeApiOptions) {
    super(deps, {
      ...opts ?? {},
      objectConstructor: ValidatingWebhookConfiguration,
    });
  }
}
