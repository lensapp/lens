/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const navigateTo = [
  "navigate-to-preference-tab-id",
  "navigate-to-preference-tab",
  "navigate-to-front-page",
  "navigate-to-horizontal-pod-autoscalers",
  "navigate-to-secrets",
  "navigate-to-limit-ranges",
  "navigate-to-pod-disruption-budgets",
  "navigate-to-resource-quotas",
  "navigate-to-priority-classes",
  "navigate-to-config-maps",
  "navigate-to-nodes",
  "navigate-to-port-forwards",
  "navigate-to-endpoints",
  "navigate-to-network-policies",
  "navigate-to-ingresses",
  "navigate-to-services",
  "navigate-to-persistent-volumes",
  "navigate-to-persistent-volume-claims",
  "navigate-to-storage-classes",
  "navigate-to-namespaces",
  "navigate-to-statefulsets",
  "navigate-to-cron-jobs",
  "navigate-to-pods",
  "navigate-to-replicasets",
  "navigate-to-daemonsets",
  "navigate-to-jobs",
  "navigate-to-workloads-overview",
  "navigate-to-deployments",
  "navigate-to-crd-list",
  "navigate-to-custom-resources",
  "navigate-to-pod-security-policies",
  "navigate-to-cluster-role-bindings",
  "navigate-to-roles",
  "navigate-to-role-bindings",
  "navigate-to-service-accounts",
  "navigate-to-cluster-roles",
  "navigate-to-events",
  "navigate-to-cluster-overview",
  "navigate-to-helm-releases",
  "navigate-to-helm-charts",
  "navigate-to-extension-preferences",
  "navigate-to-app-preferences",
  "navigate-to-proxy-preferences",
  "navigate-to-preferences",
  "navigate-to-terminal-preferences",
  "navigate-to-telemetry-preferences",
  "navigate-to-kubernetes-preferences",
  "navigate-to-editor-preferences",
  "navigate-to-add-cluster",
  "navigate-to-catalog",
  "navigate-to-welcome",
  "navigate-to-extensions",
  "navigate-to-cluster-view",
  "navigate-to-entity-settings",
];

const helmInjectableIds = [
  "update-helm-release",
  "install-helm-chart",
  "delete-helm-release",
  "list-helm-charts",
  "add-helm-repository-channel",
  "remove-helm-repository-channel",
  "select-helm-repository",
  "call-for-helm-chart-versions",
];

const kubeConfigActions = [
  "create-cluster",
  "add-sync-entries",
  "open-delete-cluster-dialog",
];

const extensions = [
  "enable-extension",
  "disable-extension",
  "attempt-install",
  "unpack-extension",
  "install-extension-from-input",
  "confirm-uninstall-extension",
  "uninstall-extension",
];

const externalActions = ["open-link-in-browser"];

const terminal = ["create-terminal-tab"];

const telemetryWhiteListForParameterlessFunctionsInjectable = getInjectable({
  id: "telemetry-white-list-for-parameterless-functions",
  instantiate: () => new Set([
    ...navigateTo,
    ...helmInjectableIds,
    ...kubeConfigActions,
    ...extensions,
    ...externalActions,
    ...terminal,
  ]),
  decorable: false,
});

export default telemetryWhiteListForParameterlessFunctionsInjectable;
