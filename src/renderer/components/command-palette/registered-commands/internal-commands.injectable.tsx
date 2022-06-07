/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { RegisteredEntitySetting } from "../../../../extensions/registries";
import { EntitySettingRegistry } from "../../../../extensions/registries";
import { HotbarAddCommand } from "../../hotbar/hotbar-add-command";
import { HotbarRemoveCommand } from "../../hotbar/hotbar-remove-command";
import { HotbarSwitchCommand } from "../../hotbar/hotbar-switch-command";
import { HotbarRenameCommand } from "../../hotbar/hotbar-rename-command";
import { ActivateEntityCommand } from "../../activate-entity-command";
import type { CommandContext, CommandRegistration } from "./commands";
import { getInjectable } from "@ogre-tools/injectable";
import commandOverlayInjectable from "../command-overlay.injectable";
import createTerminalTabInjectable from "../../dock/terminal/create-terminal-tab.injectable";
import type { DockTabCreate } from "../../dock/dock/store";
import navigateToPreferencesInjectable from "../../../../common/front-end-routing/routes/preferences/navigate-to-preferences.injectable";
import navigateToHelmChartsInjectable from "../../../../common/front-end-routing/routes/cluster/helm/charts/navigate-to-helm-charts.injectable";
import navigateToHelmReleasesInjectable from "../../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";
import navigateToConfigMapsInjectable from "../../../../common/front-end-routing/routes/cluster/config/config-maps/navigate-to-config-maps.injectable";
import navigateToSecretsInjectable from "../../../../common/front-end-routing/routes/cluster/config/secrets/navigate-to-secrets.injectable";
import navigateToResourceQuotasInjectable from "../../../../common/front-end-routing/routes/cluster/config/resource-quotas/navigate-to-resource-quotas.injectable";
import navigateToLimitRangesInjectable from "../../../../common/front-end-routing/routes/cluster/config/limit-ranges/navigate-to-limit-ranges.injectable";
import navigateToHorizontalPodAutoscalersInjectable from "../../../../common/front-end-routing/routes/cluster/config/horizontal-pod-autoscalers/navigate-to-horizontal-pod-autoscalers.injectable";
import navigateToPodDisruptionBudgetsInjectable from "../../../../common/front-end-routing/routes/cluster/config/pod-disruption-budgets/navigate-to-pod-disruption-budgets.injectable";
import navigateToServicesInjectable from "../../../../common/front-end-routing/routes/cluster/network/services/navigate-to-services.injectable";
import navigateToEndpointsInjectable from "../../../../common/front-end-routing/routes/cluster/network/endpoints/navigate-to-endpoints.injectable";
import navigateToIngressesInjectable from "../../../../common/front-end-routing/routes/cluster/network/ingresses/navigate-to-ingresses.injectable";
import navigateToNetworkPoliciesInjectable from "../../../../common/front-end-routing/routes/cluster/network/network-policies/navigate-to-network-policies.injectable";
import navigateToNodesInjectable from "../../../../common/front-end-routing/routes/cluster/nodes/navigate-to-nodes.injectable";
import navigateToPodsInjectable from "../../../../common/front-end-routing/routes/cluster/workloads/pods/navigate-to-pods.injectable";
import navigateToDeploymentsInjectable  from "../../../../common/front-end-routing/routes/cluster/workloads/deployments/navigate-to-deployments.injectable";
import navigateToDaemonsetsInjectable from "../../../../common/front-end-routing/routes/cluster/workloads/daemonsets/navigate-to-daemonsets.injectable";
import navigateToStatefulsetsInjectable from "../../../../common/front-end-routing/routes/cluster/workloads/statefulsets/navigate-to-statefulsets.injectable";
import navigateToJobsInjectable from "../../../../common/front-end-routing/routes/cluster/workloads/jobs/navigate-to-jobs.injectable";
import navigateToCronJobsInjectable from "../../../../common/front-end-routing/routes/cluster/workloads/cron-jobs/navigate-to-cron-jobs.injectable";
import navigateToCustomResourcesInjectable from "../../../../common/front-end-routing/routes/cluster/custom-resources/custom-resources/navigate-to-custom-resources.injectable";
import navigateToEntitySettingsInjectable from "../../../../common/front-end-routing/routes/entity-settings/navigate-to-entity-settings.injectable";

export function isKubernetesClusterActive(context: CommandContext): boolean {
  return context.entity?.kind === "KubernetesCluster";
}

interface Dependencies {
  openCommandDialog: (component: React.ReactElement) => void;
  getEntitySettingItems: (kind: string, apiVersion: string, source?: string) => RegisteredEntitySetting[];
  createTerminalTab: () => DockTabCreate;

  navigateToPreferences: () => void;
  navigateToHelmCharts: () => void;
  navigateToHelmReleases: () => void;
  navigateToConfigMaps: () => void;
  navigateToSecrets: () => void;
  navigateToResourceQuotas: () => void;
  navigateToLimitRanges: () => void;
  navigateToHorizontalPodAutoscalers: () => void;
  navigateToPodDisruptionBudgets: () => void;
  navigateToServices: () => void;
  navigateToEndpoints: () => void;
  navigateToIngresses: () => void;
  navigateToNetworkPolicies: () => void;
  navigateToNodes: () => void;
  navigateToPods: () => void;
  navigateToDeployments: () => void;
  navigateToDaemonsets: () => void;
  navigateToStatefulsets: () => void;
  navigateToJobs: () => void;
  navigateToCronJobs: () => void;
  navigateToCustomResources: () => void;
  navigateToEntitySettings: (entityId: string) => void;
}

function getInternalCommands(dependencies: Dependencies): CommandRegistration[] {
  return [
    {
      id: "app.showPreferences",
      title: "Preferences: Open",
      action: () => dependencies.navigateToPreferences(),
    },
    {
      id: "cluster.viewHelmCharts",
      title: "Cluster: View Helm Charts",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToHelmCharts(),
    },
    {
      id: "cluster.viewHelmReleases",
      title: "Cluster: View Helm Releases",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToHelmReleases(),
    },
    {
      id: "cluster.viewConfigMaps",
      title: "Cluster: View ConfigMaps",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToConfigMaps(),
    },
    {
      id: "cluster.viewSecrets",
      title: "Cluster: View Secrets",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToSecrets(),
    },
    {
      id: "cluster.viewResourceQuotas",
      title: "Cluster: View ResourceQuotas",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToResourceQuotas(),
    },
    {
      id: "cluster.viewLimitRanges",
      title: "Cluster: View LimitRanges",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToLimitRanges(),
    },
    {
      id: "cluster.viewHorizontalPodAutoscalers",
      title: "Cluster: View HorizontalPodAutoscalers (HPA)",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToHorizontalPodAutoscalers(),
    },
    {
      id: "cluster.viewPodDisruptionBudget",
      title: "Cluster: View PodDisruptionBudgets",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToPodDisruptionBudgets(),
    },
    {
      id: "cluster.viewServices",
      title: "Cluster: View Services",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToServices(),
    },
    {
      id: "cluster.viewEndpoints",
      title: "Cluster: View Endpoints",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToEndpoints(),
    },
    {
      id: "cluster.viewIngresses",
      title: "Cluster: View Ingresses",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToIngresses(),
    },
    {
      id: "cluster.viewNetworkPolicies",
      title: "Cluster: View NetworkPolicies",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToNetworkPolicies,
    },
    {
      id: "cluster.viewNodes",
      title: "Cluster: View Nodes",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToNodes(),
    },
    {
      id: "cluster.viewPods",
      title: "Cluster: View Pods",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToPods(),
    },
    {
      id: "cluster.viewDeployments",
      title: "Cluster: View Deployments",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToDeployments(),
    },
    {
      id: "cluster.viewDaemonSets",
      title: "Cluster: View DaemonSets",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToDaemonsets(),
    },
    {
      id: "cluster.viewStatefulSets",
      title: "Cluster: View StatefulSets",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToStatefulsets(),
    },
    {
      id: "cluster.viewJobs",
      title: "Cluster: View Jobs",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToJobs(),
    },
    {
      id: "cluster.viewCronJobs",
      title: "Cluster: View CronJobs",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToCronJobs(),
    },
    {
      id: "cluster.viewCustomResourceDefinitions",
      title: "Cluster: View Custom Resource Definitions",
      isActive: isKubernetesClusterActive,
      action: () => dependencies.navigateToCustomResources(),
    },
    {
      id: "entity.viewSettings",
      title: ({ entity }) => `${entity.kind}/${entity.getName()}: View Settings`,
      action: ({ entity }) => dependencies.navigateToEntitySettings(entity.getId()),
      isActive: ({ entity }) => (
        entity
        && dependencies.getEntitySettingItems(entity.kind, entity.apiVersion, entity.metadata.source).length > 0
      ),
    },
    {
      id: "cluster.openTerminal",
      title: "Cluster: Open terminal",
      action: () => dependencies.createTerminalTab(),
      isActive: isKubernetesClusterActive,
    },
    {
      id: "hotbar.switchHotbar",
      title: "Hotbar: Switch ...",
      action: () => dependencies.openCommandDialog(<HotbarSwitchCommand />),
    },
    {
      id: "hotbar.addHotbar",
      title: "Hotbar: Add Hotbar ...",
      action: () => dependencies.openCommandDialog(<HotbarAddCommand />),
    },
    {
      id: "hotbar.removeHotbar",
      title: "Hotbar: Remove Hotbar ...",
      action: () => dependencies.openCommandDialog(<HotbarRemoveCommand />),
    },
    {
      id: "hotbar.renameHotbar",
      title: "Hotbar: Rename Hotbar ...",
      action: () => dependencies.openCommandDialog(<HotbarRenameCommand />),
    },
    {
      id: "catalog.searchEntities",
      title: "Catalog: Activate Entity ...",
      action: () => dependencies.openCommandDialog(<ActivateEntityCommand />),
    },
  ];
}

const internalCommandsInjectable = getInjectable({
  id: "internal-commands",

  instantiate: (di) => getInternalCommands({
    openCommandDialog: di.inject(commandOverlayInjectable).open,
    getEntitySettingItems: EntitySettingRegistry
      .getInstance()
      .getItemsForKind,
    createTerminalTab: di.inject(createTerminalTabInjectable),
    navigateToPreferences: di.inject(navigateToPreferencesInjectable),
    navigateToHelmCharts: di.inject(navigateToHelmChartsInjectable),
    navigateToHelmReleases: di.inject(navigateToHelmReleasesInjectable),
    navigateToConfigMaps: di.inject(navigateToConfigMapsInjectable),
    navigateToSecrets: di.inject(navigateToSecretsInjectable),
    navigateToResourceQuotas: di.inject(navigateToResourceQuotasInjectable),
    navigateToLimitRanges: di.inject(navigateToLimitRangesInjectable),
    navigateToHorizontalPodAutoscalers: di.inject(navigateToHorizontalPodAutoscalersInjectable),
    navigateToPodDisruptionBudgets: di.inject(navigateToPodDisruptionBudgetsInjectable),
    navigateToServices: di.inject(navigateToServicesInjectable),
    navigateToEndpoints: di.inject(navigateToEndpointsInjectable),
    navigateToIngresses: di.inject(navigateToIngressesInjectable),
    navigateToNetworkPolicies: di.inject(navigateToNetworkPoliciesInjectable),
    navigateToNodes: di.inject(navigateToNodesInjectable),
    navigateToPods: di.inject(navigateToPodsInjectable),
    navigateToDeployments: di.inject(navigateToDeploymentsInjectable),
    navigateToDaemonsets: di.inject(navigateToDaemonsetsInjectable),
    navigateToStatefulsets: di.inject(navigateToStatefulsetsInjectable),
    navigateToJobs: di.inject(navigateToJobsInjectable),
    navigateToCronJobs: di.inject(navigateToCronJobsInjectable),
    navigateToCustomResources: di.inject(navigateToCustomResourcesInjectable),
    navigateToEntitySettings: di.inject(navigateToEntitySettingsInjectable),
  }),
});

export default internalCommandsInjectable;
