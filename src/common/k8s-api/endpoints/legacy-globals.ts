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
import roleApiInjectable from "./role.api.injectable";

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
