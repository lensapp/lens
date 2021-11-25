/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from "react";
import * as routes from "../../../../common/routes";
import { EntitySettingRegistry } from "../../../../extensions/registries";
import { CommandOverlay } from "../../../components/command-palette";
import { createTerminalTab } from "../../../components/dock/terminal.store";
import { HotbarAddCommand } from "../../../components/hotbar/hotbar-add-command";
import { HotbarRemoveCommand } from "../../../components/hotbar/hotbar-remove-command";
import { HotbarSwitchCommand } from "../../../components/hotbar/hotbar-switch-command";
import { HotbarRenameCommand } from "../../../components/hotbar/hotbar-rename-command";
import { ActivateEntityCommand } from "../../../components/activate-entity-command";
import type { CommandContext, CommandRegistration } from "./commands";

export function isKubernetesClusterActive(context: CommandContext): boolean {
  return context.entity?.kind === "KubernetesCluster";
}

export const internalCommands: CommandRegistration[] = [
  {
    id: "app.showPreferences",
    title: "Preferences: Open",
    action: ({ navigate }) => navigate(routes.preferencesURL(), {
      forceRootFrame: true,
    }),
  },
  {
    id: "cluster.viewHelmCharts",
    title: "Cluster: View Helm Charts",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.helmChartsURL()),
  },
  {
    id: "cluster.viewHelmReleases",
    title: "Cluster: View Helm Releases",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.releaseURL()),
  },
  {
    id: "cluster.viewConfigMaps",
    title: "Cluster: View ConfigMaps",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.configMapsURL()),
  },
  {
    id: "cluster.viewSecrets",
    title: "Cluster: View Secrets",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.secretsURL()),
  },
  {
    id: "cluster.viewResourceQuotas",
    title: "Cluster: View ResourceQuotas",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.resourceQuotaURL()),
  },
  {
    id: "cluster.viewLimitRanges",
    title: "Cluster: View LimitRanges",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.limitRangeURL()),
  },
  {
    id: "cluster.viewHorizontalPodAutoscalers",
    title: "Cluster: View HorizontalPodAutoscalers (HPA)",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.hpaURL()),
  },
  {
    id: "cluster.viewPodDisruptionBudget",
    title: "Cluster: View PodDisruptionBudgets",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.pdbURL()),
  },
  {
    id: "cluster.viewServices",
    title: "Cluster: View Services",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.servicesURL()),
  },
  {
    id: "cluster.viewEndpoints",
    title: "Cluster: View Endpoints",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.endpointURL()),
  },
  {
    id: "cluster.viewIngresses",
    title: "Cluster: View Ingresses",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.ingressURL()),
  },
  {
    id: "cluster.viewNetworkPolicies",
    title: "Cluster: View NetworkPolicies",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.networkPoliciesURL()),
  },
  {
    id: "cluster.viewNodes",
    title: "Cluster: View Nodes",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.nodesURL()),
  },
  {
    id: "cluster.viewPods",
    title: "Cluster: View Pods",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.podsURL()),
  },
  {
    id: "cluster.viewDeployments",
    title: "Cluster: View Deployments",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.deploymentsURL()),
  },
  {
    id: "cluster.viewDaemonSets",
    title: "Cluster: View DaemonSets",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.daemonSetsURL()),
  },
  {
    id: "cluster.viewStatefulSets",
    title: "Cluster: View StatefulSets",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.statefulSetsURL()),
  },
  {
    id: "cluster.viewJobs",
    title: "Cluster: View Jobs",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.jobsURL()),
  },
  {
    id: "cluster.viewCronJobs",
    title: "Cluster: View CronJobs",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.cronJobsURL()),
  },
  {
    id: "cluster.viewCustomResourceDefinitions",
    title: "Cluster: View Custom Resource Definitions",
    isActive: isKubernetesClusterActive,
    action: ({ navigate }) => navigate(routes.crdURL()),
  },
  {
    id: "entity.viewSettings",
    title: ({ entity }) => `${entity.kind}/${entity.getName()}: View Settings`,
    action: ({ entity, navigate }) => navigate(`/entity/${entity.getId()}/settings`, {
      forceRootFrame: true,
    }),
    isActive: ({ entity }) => {
      if (!entity) {
        return false;
      }

      // TODO: replace with injection
      const entries = EntitySettingRegistry.getInstance()
        .getItemsForKind(entity.kind, entity.apiVersion, entity.metadata.source);

      return entries.length > 0;
    },
  },
  {
    id: "cluster.openTerminal",
    title: "Cluster: Open terminal",
    action: () => createTerminalTab(),
    isActive: isKubernetesClusterActive,
  },
  {
    id: "hotbar.switchHotbar",
    title: "Hotbar: Switch ...",
    action: () => CommandOverlay.open(<HotbarSwitchCommand />),
  },
  {
    id: "hotbar.addHotbar",
    title: "Hotbar: Add Hotbar ...",
    action: () => CommandOverlay.open(<HotbarAddCommand />),
  },
  {
    id: "hotbar.removeHotbar",
    title: "Hotbar: Remove Hotbar ...",
    action: () => CommandOverlay.open(<HotbarRemoveCommand />),
  },
  {
    id: "hotbar.renameHotbar",
    title: "Hotbar: Rename Hotbar ...",
    action: () => CommandOverlay.open(<HotbarRenameCommand />),
  },
  {
    id: "catalog.searchEntities",
    title: "Catalog: Activate Entity ...",
    action: () => CommandOverlay.open(<ActivateEntityCommand />),
  },
];
