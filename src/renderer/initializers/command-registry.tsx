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
import * as routes from "../../common/routes";
import { CommandRegistry } from "../../extensions/registries";
import { getActiveClusterEntity } from "../api/catalog-entity-registry";
import { CommandOverlay } from "../components/command-palette";
import { createTerminalTab } from "../components/dock/terminal.store";
import { HotbarAddCommand } from "../components/hotbar/hotbar-add-command";
import { HotbarRemoveCommand } from "../components/hotbar/hotbar-remove-command";
import { HotbarSwitchCommand } from "../components/hotbar/hotbar-switch-command";
import { navigate } from "../navigation";
import { HotbarRenameCommand } from "../components/hotbar/hotbar-rename-command";
import { ActivateEntityCommand } from "../components/activate-entity-command";

export function initCommandRegistry() {
  CommandRegistry.getInstance()
    .add([
      {
        id: "app.showPreferences",
        title: "Preferences: Open",
        scope: "global",
        action: () => navigate(routes.preferencesURL()),
      },
      {
        id: "cluster.viewHelmCharts",
        title: "Cluster: View Helm Charts",
        scope: "entity",
        action: () => navigate(routes.helmChartsURL()),
      },
      {
        id: "cluster.viewHelmReleases",
        title: "Cluster: View Helm Releases",
        scope: "entity",
        action: () => navigate(routes.releaseURL()),
      },
      {
        id: "cluster.viewConfigMaps",
        title: "Cluster: View ConfigMaps",
        scope: "entity",
        action: () => navigate(routes.configMapsURL()),
      },
      {
        id: "cluster.viewSecrets",
        title: "Cluster: View Secrets",
        scope: "entity",
        action: () => navigate(routes.secretsURL()),
      },
      {
        id: "cluster.viewResourceQuotas",
        title: "Cluster: View ResourceQuotas",
        scope: "entity",
        action: () => navigate(routes.resourceQuotaURL()),
      },
      {
        id: "cluster.viewLimitRanges",
        title: "Cluster: View LimitRanges",
        scope: "entity",
        action: () => navigate(routes.limitRangeURL()),
      },
      {
        id: "cluster.viewHorizontalPodAutoscalers",
        title: "Cluster: View HorizontalPodAutoscalers (HPA)",
        scope: "entity",
        action: () => navigate(routes.hpaURL()),
      },
      {
        id: "cluster.viewPodDisruptionBudget",
        title: "Cluster: View PodDisruptionBudgets",
        scope: "entity",
        action: () => navigate(routes.pdbURL()),
      },
      {
        id: "cluster.viewServices",
        title: "Cluster: View Services",
        scope: "entity",
        action: () => navigate(routes.servicesURL()),
      },
      {
        id: "cluster.viewEndpoints",
        title: "Cluster: View Endpoints",
        scope: "entity",
        action: () => navigate(routes.endpointURL()),
      },
      {
        id: "cluster.viewIngresses",
        title: "Cluster: View Ingresses",
        scope: "entity",
        action: () => navigate(routes.ingressURL()),
      },
      {
        id: "cluster.viewNetworkPolicies",
        title: "Cluster: View NetworkPolicies",
        scope: "entity",
        action: () => navigate(routes.networkPoliciesURL()),
      },
      {
        id: "cluster.viewNodes",
        title: "Cluster: View Nodes",
        scope: "entity",
        action: () => navigate(routes.nodesURL()),
      },
      {
        id: "cluster.viewPods",
        title: "Cluster: View Pods",
        scope: "entity",
        action: () => navigate(routes.podsURL()),
      },
      {
        id: "cluster.viewDeployments",
        title: "Cluster: View Deployments",
        scope: "entity",
        action: () => navigate(routes.deploymentsURL()),
      },
      {
        id: "cluster.viewDaemonSets",
        title: "Cluster: View DaemonSets",
        scope: "entity",
        action: () => navigate(routes.daemonSetsURL()),
      },
      {
        id: "cluster.viewStatefulSets",
        title: "Cluster: View StatefulSets",
        scope: "entity",
        action: () => navigate(routes.statefulSetsURL()),
      },
      {
        id: "cluster.viewJobs",
        title: "Cluster: View Jobs",
        scope: "entity",
        action: () => navigate(routes.jobsURL()),
      },
      {
        id: "cluster.viewCronJobs",
        title: "Cluster: View CronJobs",
        scope: "entity",
        action: () => navigate(routes.cronJobsURL()),
      },
      {
        id: "cluster.viewCurrentClusterSettings",
        title: "Cluster: View Settings",
        scope: "global",
        action: () => navigate(routes.entitySettingsURL({
          params: {
            entityId: getActiveClusterEntity()?.id,
          },
        })),
        isActive: (context) => !!context.entity,
      },
      {
        id: "cluster.openTerminal",
        title: "Cluster: Open terminal",
        scope: "entity",
        action: () => createTerminalTab(),
        isActive: (context) => !!context.entity,
      },
      {
        id: "hotbar.switchHotbar",
        title: "Hotbar: Switch ...",
        scope: "global",
        action: () => CommandOverlay.open(<HotbarSwitchCommand />),
      },
      {
        id: "hotbar.addHotbar",
        title: "Hotbar: Add Hotbar ...",
        scope: "global",
        action: () => CommandOverlay.open(<HotbarAddCommand />),
      },
      {
        id: "hotbar.removeHotbar",
        title: "Hotbar: Remove Hotbar ...",
        scope: "global",
        action: () => CommandOverlay.open(<HotbarRemoveCommand />),
      },
      {
        id: "hotbar.renameHotbar",
        title: "Hotbar: Rename Hotbar ...",
        scope: "global",
        action: () => CommandOverlay.open(<HotbarRenameCommand />),
      },
      {
        id: "catalog.searchEntities",
        title: "Catalog: Activate Entity ...",
        scope: "global",
        action: () => CommandOverlay.open(<ActivateEntityCommand />),
      },
    ]);
}
