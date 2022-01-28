/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { readFile } from "fs/promises";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { CatalogCategoryRegistry } from "../../common/catalog";
import { loadConfigFromString } from "../../common/kube-helpers";
import React from "react";
import { WeblinkAddCommand } from "../components/catalog-entities/weblink-add-command";
import openCommandDialogInjectable from "../components/command-palette/open-command-dialog.injectable";
import { GeneralCategory, KubernetesClusterCategory, WebLinkCategory } from "../../common/catalog-entities";
import { runInAction } from "mobx";
import { Link } from "react-router-dom";
import { kubernetesURL, addClusterURL } from "../../common/routes";
import { isWindows, isLinux, productName } from "../../common/vars";
import { getAllEntries } from "../components/+preferences/kubeconfig-syncs";
import { Notifications } from "../components/notifications";
import { PathPicker } from "../components/path-picker";
import { multiSet } from "../utils";
import removeWeblinkByIdInjectable from "../../common/weblinks/remove-by-id.injectable";
import userPreferencesStoreInjectable from "../../common/user-preferences/store.injectable";
import getClusterByIdInjectable from "../../common/cluster-store/get-cluster-by-id.injectable";
import openDeleteClusterDialogInjectable from "../components/delete-cluster-dialog/open-delete-cluster-dialog.injectable";

const catalogCategoryRegistryInjectable = getInjectable({
  instantiate: (di) => {
    const openCommandOverlay = di.inject(openCommandDialogInjectable);
    const removeWeblinkById = di.inject(removeWeblinkByIdInjectable);
    const userStore = di.inject(userPreferencesStoreInjectable);
    const getClusterById = di.inject(getClusterByIdInjectable);
    const openDeleteClusterDialog = di.inject(openDeleteClusterDialogInjectable);

    const addSyncEntries = async (filePaths: string[]) => {
      const entries = await getAllEntries(filePaths);

      runInAction(() => {
        multiSet(userStore.syncKubeconfigEntries, entries);
      });

      Notifications.ok(
        <div>
          <p>Selected items has been added to Kubeconfig Sync.</p><br/>
          <p>Check the <Link style={{ textDecoration: "underline" }} to={`${kubernetesURL()}#kube-sync`}>Preferences</Link>{" "}
          to see full list.</p>
        </div>,
      );
    };
    const onClusterDelete = async (clusterId: string) =>{
      const cluster = getClusterById(clusterId);

      if (!cluster) {
        return console.warn("[KUBERNETES-CLUSTER]: cannot delete cluster, does not exist in store", { clusterId });
      }

      const { config, error } = loadConfigFromString(await readFile(cluster.kubeConfigPath, "utf-8"));

      if (error) {
        throw error;
      }

      openDeleteClusterDialog(cluster, config);
    };

    const registry = new CatalogCategoryRegistry();
    const kubernetesClusterCategory = new KubernetesClusterCategory();
    const webLinkCategory = new WebLinkCategory();

    registry.add(kubernetesClusterCategory);
    registry.add(new GeneralCategory());
    registry.add(webLinkCategory);

    kubernetesClusterCategory.on("contextMenuOpen", (entity, context) => {
      if (entity.metadata?.source == "local") {
        context.menuItems.push({
          title: "Delete",
          icon: "delete",
          onClick: () => onClusterDelete(entity.metadata.uid),
        });
      }
    });

    kubernetesClusterCategory.on("catalogAddMenu", ctx => {
      ctx.menuItems.push(
        {
          icon: "text_snippet",
          title: "Add from kubeconfig",
          onClick: () => ctx.navigate(addClusterURL()),
        },
      );

      if (isWindows || isLinux) {
        ctx.menuItems.push(
          {
            icon: "create_new_folder",
            title: "Sync kubeconfig folder(s)",
            defaultAction: true,
            onClick: async () => {
              await PathPicker.pick({
                label: "Sync folder(s)",
                buttonLabel: "Sync",
                properties: ["showHiddenFiles", "multiSelections", "openDirectory"],
                onPick: addSyncEntries,
              });
            },
          },
          {
            icon: "note_add",
            title: "Sync kubeconfig file(s)",
            onClick: async () => {
              await PathPicker.pick({
                label: "Sync file(s)",
                buttonLabel: "Sync",
                properties: ["showHiddenFiles", "multiSelections", "openFile"],
                onPick: addSyncEntries,
              });
            },
          },
        );
      } else {
        ctx.menuItems.push(
          {
            icon: "create_new_folder",
            title: "Sync kubeconfig(s)",
            defaultAction: true,
            onClick: async () => {
              await PathPicker.pick({
                label: "Sync file(s)",
                buttonLabel: "Sync",
                properties: ["showHiddenFiles", "multiSelections", "openFile", "openDirectory"],
                onPick: addSyncEntries,
              });
            },
          },
        );
      }
    });

    webLinkCategory.on("catalogAddMenu", (context) => {
      context.menuItems.push({
        icon: "public",
        title: "Add web link",
        onClick: () => openCommandOverlay(<WeblinkAddCommand />),
      });
    });

    webLinkCategory.on("contextMenuOpen", (entity, context) => {
      if (entity.metadata.source === "local") {
        context.menuItems.push({
          title: "Delete",
          icon: "delete",
          onClick: () => removeWeblinkById(entity.getId()),
          confirm: {
            message: `Remove Web Link "${entity.getName()}" from ${productName}?`,
          },
        });
      }
    });

    return registry;
  },
  lifecycle: lifecycleEnum.singleton,
});

export default catalogCategoryRegistryInjectable;
