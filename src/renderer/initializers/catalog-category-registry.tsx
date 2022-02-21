/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { kubernetesClusterCategory } from "../../common/catalog-entities";
import { addClusterURL, kubernetesURL } from "../../common/routes";
import { UserStore } from "../../common/user-store";
import { getAllEntries } from "../components/+preferences/kubeconfig-syncs";
import { isLinux, isWindows } from "../../common/vars";
import { PathPicker } from "../components/path-picker";
import { Notifications } from "../components/notifications";
import { Link } from "react-router-dom";

async function addSyncEntries(filePaths: string[]) {
  UserStore.getInstance().syncKubeconfigEntries.merge(await getAllEntries(filePaths));

  Notifications.ok(
    <div>
      <p>Selected items has been added to Kubeconfig Sync.</p><br/>
      <p>Check the <Link style={{ textDecoration: "underline" }} to={`${kubernetesURL()}#kube-sync`}>Preferences</Link>{" "}
      to see full list.</p>
    </div>,
  );
}

export function initCatalogCategoryRegistryEntries() {
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
}
