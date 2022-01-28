/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import * as routes from "../../../../common/routes";
import { EntitySettingRegistry, RegisteredEntitySetting } from "../../../../extensions/registries";
import { HotbarAddCommand } from "../../hotbar/hotbar-add-command";
import { HotbarRemoveCommand } from "../../hotbar/hotbar-remove-command";
import { HotbarSwitchCommand } from "../../hotbar/hotbar-switch-command";
import { HotbarRenameCommand } from "../../hotbar/hotbar-rename-command";
import { ActivateEntityCommand } from "../../activate-entity-command";
import type { CommandContext, CommandRegistration } from "./commands";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import newTerminalTabInjectable from "../../dock/terminal/create-tab.injectable";
import openCommandDialogInjectable from "../open-command-dialog.injectable";

export function isKubernetesClusterActive(context: CommandContext): boolean {
  return context.entity?.kind === "KubernetesCluster";
}

interface Dependencies {
  openCommandDialog: (component: React.ReactElement) => void;
  getEntitySettingItems: (kind: string, apiVersion: string, source?: string) => RegisteredEntitySetting[];
  newTerminalTab: () => void;
}

function getInternalCommands({ openCommandDialog, getEntitySettingItems, newTerminalTab }: Dependencies): CommandRegistration[] {
  return [
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

        return getEntitySettingItems(entity.kind, entity.apiVersion, entity.metadata.source).length > 0;
      },
    },
    {
      id: "cluster.openTerminal",
      title: "Cluster: Open terminal",
      action: newTerminalTab,
      isActive: isKubernetesClusterActive,
    },
    {
      id: "hotbar.switchHotbar",
      title: "Hotbar: Switch ...",
      action: () => openCommandDialog(<HotbarSwitchCommand />),
    },
    {
      id: "hotbar.addHotbar",
      title: "Hotbar: Add Hotbar ...",
      action: () => openCommandDialog(<HotbarAddCommand />),
    },
    {
      id: "hotbar.removeHotbar",
      title: "Hotbar: Remove Hotbar ...",
      action: () => openCommandDialog(<HotbarRemoveCommand />),
    },
    {
      id: "hotbar.renameHotbar",
      title: "Hotbar: Rename Hotbar ...",
      action: () => openCommandDialog(<HotbarRenameCommand />),
    },
    {
      id: "catalog.searchEntities",
      title: "Catalog: Activate Entity ...",
      action: () => openCommandDialog(<ActivateEntityCommand />),
    },
  ];
}

const internalCommandsInjectable = getInjectable({
  instantiate: (di) => getInternalCommands({
    openCommandDialog: di.inject(openCommandDialogInjectable),
    getEntitySettingItems: EntitySettingRegistry
      .getInstance()
      .getItemsForKind,
    newTerminalTab: di.inject(newTerminalTabInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default internalCommandsInjectable;
