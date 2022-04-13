/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalForExtensionApi } from "../../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import clusterRoleBindingApiInjectable from "./cluster-role-binding.api.injectable";
import clusterRoleApiInjectable from "./cluster-role.api.injectable";
import clusterApiInjectable from "./cluster.api.injectable";
import componentStatusApiInjectable from "./component-status.api.injectable";
import configMapApiInjectable from "./config-map.api.injectable";
import cronJobApiInjectable from "./cron-job.api.injectable";
import customResourceDefinitionApiInjectable from "./custom-resource-definition.api.injectable";
import daemonSetApiInjectable from "./daemon-set.api.injectable";
import deploymentApiInjectable from "./deployment.api.injectable";
import endpointsApiInjectable from "./endpoint.api.injectable";
import kubeEventApiInjectable from "./events.api.injectable";
import horizontalPodAutoscalerApiInjectable from "./horizontal-pod-autoscaler.api.injectable";
import ingressApiInjectable from "./ingress.api.injectable";
import jobApiInjectable from "./job.api.injectable";
import limitRangeApiInjectable from "./limit-range.api.injectable";
import namespaceApiInjectable from "./namespace.api.injectable";
import networkPolicyApiInjectable from "./network-policy.api.injectable";
import nodeApiInjectable from "./node.api.injectable";
import persistentVolumeClaimApiInjectable from "./persistent-volume-claim.api.injectable";
import persistentVolumeApiInjectable from "./persistent-volume.api.injectable";
import podDisruptionBudgetApiInjectable from "./pod-disruption-budget.api.injectable";
import podMetricsApiInjectable from "./pod-metrics.api.injectable";
import podSecurityPolicyApiInjectable from "./pod-security-policy.api.injectable";
import podApiInjectable from "./pod.api.injectable";
import replicaSetApiInjectable from "./replica-set.api.injectable";
import resourceQuotaApiInjectable from "./resource-quota.api.injectable";
import roleBindingApiInjectable from "./role-binding.api.injectable";
import roleApiInjectable from "./role.api.injectable";
import secretApiInjectable from "./secret.api.injectable";
import selfSubjectRulesReviewApiInjectable from "./self-subject-rules-reviews.api.injectable";
import serviceAccountApiInjectable from "./service-account.api.injectable";
import serviceApiInjectable from "./service.api.injectable";
import statefulSetApiInjectable from "./stateful-set.api.injectable";
import storageClassApiInjectable from "./storage-class.api.injectable";

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

/**
 * @deprecated use `di.inject(statefulSetApiInjectable)` instead
 */
export const statefulSetApi = asLegacyGlobalForExtensionApi(statefulSetApiInjectable);

/**
 * @deprecated use `di.inject(deploymentApiInjectable)` instead
 */
export const deploymentApi = asLegacyGlobalForExtensionApi(deploymentApiInjectable);

/**
 * @deprecated use `di.inject(cronJobApiInjectable)` instead
 */
export const cronJobApi = asLegacyGlobalForExtensionApi(cronJobApiInjectable);

/**
 * @deprecated use `di.inject(jobApiInjectable)` instead
 */
export const jobApi = asLegacyGlobalForExtensionApi(jobApiInjectable);

/**
 * @deprecated use `di.inject(clusterApiInjectable)` instead
 */
export const clusterApi = asLegacyGlobalForExtensionApi(clusterApiInjectable);

/**
 * @deprecated use `di.inject(configMapApiInjectable)` instead
 */
export const configMapApi = asLegacyGlobalForExtensionApi(configMapApiInjectable);

/**
 * @deprecated use `di.inject(componentStatusApiInjectable)` instead
 */
export const componentStatusApi = asLegacyGlobalForExtensionApi(componentStatusApiInjectable);

/**
 * @deprecated use `di.inject(customResourceDefinitionApiInjectable)` instead
 */
export const customResourceDefinitionApi = asLegacyGlobalForExtensionApi(customResourceDefinitionApiInjectable);

/**
 * @deprecated use `di.inject(kubeEventApiInjectable)` instead
 */
export const kubeEventApi = asLegacyGlobalForExtensionApi(kubeEventApiInjectable);

/**
 * @deprecated use `di.inject(endpointsApiInjectable)` instead
 */
export const endpointsApi = asLegacyGlobalForExtensionApi(endpointsApiInjectable);

/**
 * @deprecated use `di.inject(horizontalPodAutoscalerApiInjectable)` instead
 */
export const horizontalPodAutoscalerApi = asLegacyGlobalForExtensionApi(horizontalPodAutoscalerApiInjectable);

/**
 * @deprecated use `di.inject(ingressApiInjectable)` instead
 */
export const ingressApi = asLegacyGlobalForExtensionApi(ingressApiInjectable);

/**
 * @deprecated use `di.inject(limitRangeApiInjectable)` instead
 */
export const limitRangeApi = asLegacyGlobalForExtensionApi(limitRangeApiInjectable);

/**
 * @deprecated use `di.inject(namespaceApiInjectable)` instead
 */
export const namespaceApi = asLegacyGlobalForExtensionApi(namespaceApiInjectable);

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
 * @deprecated use `di.inject(persistentVolumeApiInjectable)` instead
 */
export const persistentVolumeApi = asLegacyGlobalForExtensionApi(persistentVolumeApiInjectable);

/**
 * @deprecated use `di.inject(podDisruptionBudgetApiInjectable)` instead
 */
export const podDisruptionBudgetApi = asLegacyGlobalForExtensionApi(podDisruptionBudgetApiInjectable);

/**
 * @deprecated use `di.inject(podMetricsApiInjectable)` instead
 */
export const podMetricsApi = asLegacyGlobalForExtensionApi(podMetricsApiInjectable);

/**
 * @deprecated use `di.inject(podSecurityPolicyApiInjectable)` instead
 */
export const podSecurityPolicyApi = asLegacyGlobalForExtensionApi(podSecurityPolicyApiInjectable);

/**
 * @deprecated use `di.inject(resourceQuotaApiInjectable)` instead
 */
export const resourceQuotaApi = asLegacyGlobalForExtensionApi(resourceQuotaApiInjectable);

/**
 * @deprecated use `di.inject(roleBindingApiInjectable)` instead
 */
export const roleBindingApi = asLegacyGlobalForExtensionApi(roleBindingApiInjectable);

/**
 * @deprecated use `di.inject(secretApiInjectable)` instead
 */
export const secretApi = asLegacyGlobalForExtensionApi(secretApiInjectable);

/**
 * @deprecated use `di.inject(selfSubjectRulesReviewApiInjectable)` instead
 */
export const selfSubjectRulesReviewApi = asLegacyGlobalForExtensionApi(selfSubjectRulesReviewApiInjectable);

/**
 * @deprecated use `di.inject(serviceApiInjectable)` instead
 */
export const serviceApi = asLegacyGlobalForExtensionApi(serviceApiInjectable);

/**
 * @deprecated use `di.inject(storageClassApiInjectable)` instead
 */
export const storageClassApi = asLegacyGlobalForExtensionApi(storageClassApiInjectable);
