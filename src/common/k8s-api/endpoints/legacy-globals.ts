/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalForExtensionApi } from "../../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import configMapApiInjectable from "./config-map.api.injectable";
import cronJobApiInjectable from "./cron-job.api.injectable";
import jobApiInjectable from "./job.api.injectable";
import networkPolicyApiInjectable from "./network-policy.api.injectable";
import nodeApiInjectable from "./node.api.injectable";
import persistentVolumeClaimApiInjectable from "./persistent-volume-claim.api.injectable";
import podApiInjectable from "./pod.api.injectable";
import resourceQuotaApiInjectable from "./resource-quota.api.injectable";
import roleApiInjectable from "./role.api.injectable";
import secretApiInjectable from "./secret.api.injectable";
import serviceApiInjectable from "./service.api.injectable";
import storageClassApiInjectable from "./storage-class.api.injectable";

/**
 * @deprecated use `di.inject(roleApiInjectable)` instead
 */
export const roleApi = asLegacyGlobalForExtensionApi(roleApiInjectable);

/**
 * @deprecated use `di.inject(podApiInjectable)` instead
 */
export const podApi = asLegacyGlobalForExtensionApi(podApiInjectable);

/**
 * @deprecated use `di.inject(cronJobApiInjectable)` instead
 */
export const cronJobApi = asLegacyGlobalForExtensionApi(cronJobApiInjectable);

/**
 * @deprecated use `di.inject(jobApiInjectable)` instead
 */
export const jobApi = asLegacyGlobalForExtensionApi(jobApiInjectable);

/**
 * @deprecated use `di.inject(configMapApiInjectable)` instead
 */
export const configMapApi = asLegacyGlobalForExtensionApi(configMapApiInjectable);

/**
 * @deprecated use `di.inject(networkPolicyApiInjectable)` instead
 */
export const networkPolicyApi = asLegacyGlobalForExtensionApi(networkPolicyApiInjectable);

/**
 * @deprecated use `di.inject(nodeApiInjectable)` instead
 */
export const nodeApi = asLegacyGlobalForExtensionApi(nodeApiInjectable);

/**
 * @deprecated use `di.inject(persistentVolumeClaimApiInjectable)` instead
 */
export const persistentVolumeClaimApi = asLegacyGlobalForExtensionApi(persistentVolumeClaimApiInjectable);

/**
 * @deprecated use `di.inject(resourceQuotaApiInjectable)` instead
 */
export const resourceQuotaApi = asLegacyGlobalForExtensionApi(resourceQuotaApiInjectable);

/**
 * @deprecated use `di.inject(secretApiInjectable)` instead
 */
export const secretApi = asLegacyGlobalForExtensionApi(secretApiInjectable);

/**
 * @deprecated use `di.inject(serviceApiInjectable)` instead
 */
export const serviceApi = asLegacyGlobalForExtensionApi(serviceApiInjectable);

/**
 * @deprecated use `di.inject(storageClassApiInjectable)` instead
 */
export const storageClassApi = asLegacyGlobalForExtensionApi(storageClassApiInjectable);
