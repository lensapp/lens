/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type {
  MutatingWebhookConfiguration,
  MutatingWebhookConfigurationApi,
} from "../../../common/k8s-api/endpoints";
import type {
  KubeObjectStoreDependencies,
  KubeObjectStoreOptions,
} from "../../../common/k8s-api/kube-object.store";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";

export interface MutatingWebhookConfigurationStoreDependencies extends KubeObjectStoreDependencies {
}

export class MutatingWebhookConfigurationStore extends KubeObjectStore<MutatingWebhookConfiguration, MutatingWebhookConfigurationApi> {
  constructor(protected readonly dependencies: MutatingWebhookConfigurationStoreDependencies, api: MutatingWebhookConfigurationApi, opts?: KubeObjectStoreOptions) {
    super(dependencies, api, opts);
  }
}
