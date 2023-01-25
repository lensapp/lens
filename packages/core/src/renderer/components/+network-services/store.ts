/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { Service, ServiceApi } from "../../../common/k8s-api/endpoints/service.api";

export class ServiceStore extends KubeObjectStore<Service, ServiceApi> {
}
