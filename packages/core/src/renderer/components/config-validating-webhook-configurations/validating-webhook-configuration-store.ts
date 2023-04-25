/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type {
  ValidatingWebhookConfiguration,
  ValidatingWebhookConfigurationApi,
} from "../../../common/k8s-api/endpoints";
import type {
  KubeObjectStoreDependencies,
  KubeObjectStoreOptions,
} from "../../../common/k8s-api/kube-object.store";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";

export interface ValidatingWebhookConfigurationStoreDependencies extends KubeObjectStoreDependencies {
}

export class ValidatingWebhookConfigurationStore extends KubeObjectStore<ValidatingWebhookConfiguration, ValidatingWebhookConfigurationApi> {
  constructor(protected readonly dependencies: ValidatingWebhookConfigurationStoreDependencies, api: ValidatingWebhookConfigurationApi, opts?: KubeObjectStoreOptions) {
    super(dependencies, api, opts);
  }
}
