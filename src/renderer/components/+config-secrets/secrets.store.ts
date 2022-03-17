/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { Secret, SecretApi, SecretData } from "../../../common/k8s-api/endpoints";
import { secretApi } from "../../../common/k8s-api/endpoints";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { isClusterPageContext } from "../../utils";

export class SecretStore extends KubeObjectStore<Secret, SecretApi, SecretData> {
}

export const secretStore = isClusterPageContext()
  ? new SecretStore(secretApi)
  : undefined as never;

if (isClusterPageContext()) {
  apiManager.registerStore(secretStore);
}
