/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalForExtensionApi } from "../../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import clusterRoleBindingApiInjectable from "./cluster-role-binding.api.injectable";
import clusterRoleApiInjectable from "./cluster-role.api.injectable";
import daemonSetApiInjectable from "./daemon-set.api.injectable";
import podApiInjectable from "./pod.api.injectable";
import replicaSetApiInjectable from "./replica-set.api.injectable";
import roleApiInjectable from "./role.api.injectable";
import serviceAccountApiInjectable from "./service-account.api.injectable";

/**
 * @deprecated use `di.inject(clusterRoleBindingApiInjectable)` instead
 */
export const clusterRoleBindingApi = asLegacyGlobalForExtensionApi(clusterRoleBindingApiInjectable);

/**
 * @deprecated use `di.inject(clusterRoleApiInjectable)` instead
 */
export const clusterRoleApi = asLegacyGlobalForExtensionApi(clusterRoleApiInjectable);

/**
 * @deprecated use `di.inject(serviceAccountApiInjectable)` instead
 */
export const serviceAccountApi = asLegacyGlobalForExtensionApi(serviceAccountApiInjectable);

/**
 * @deprecated use `di.inject(roleApiInjectable)` instead
 */
export const roleApi = asLegacyGlobalForExtensionApi(roleApiInjectable);

/**
 * @deprecated use `di.inject(podApiInjectable)` instead
 */
export const podApi = asLegacyGlobalForExtensionApi(podApiInjectable);

/**
 * @deprecated use `di.inject(daemonSetApiInjectable)` instead
 */
export const daemonSetApi = asLegacyGlobalForExtensionApi(daemonSetApiInjectable);

/**
 * @deprecated use `di.inject(replicaSetApiInjectable)` instead
 */
export const replicaSetApi = asLegacyGlobalForExtensionApi(replicaSetApiInjectable);
