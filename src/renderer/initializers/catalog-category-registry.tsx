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
import { kubernetesClusterCategory } from "../../common/catalog-entities";
import { addClusterURL, kubernetesURL } from "../../common/routes";
import { multiSet } from "../utils";
import { UserStore } from "../../common/user-store";
import { getAllEntries } from "../components/+preferences/kubeconfig-syncs";
import { runInAction } from "mobx";
import { isWindows } from "../../common/vars";
import { PathPicker } from "../components/path-picker";
import { Notifications } from "../components/notifications";
import { Link } from "react-router-dom";

async function addSyncEntries(filePaths: string[]) {
  const entries = await getAllEntries(filePaths);

  runInAction(() => {
    multiSet(UserStore.getInstance().syncKubeconfigEntries, entries);
  });

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

    if (isWindows) {
      ctx.menuItems.push(
        {
          icon: "create_new_folder",
          title: "Sync kubeconfig folders(s)",
          defaultAction: true,
          onClick: async () => {
            await PathPicker.pick({
              label: "Sync folders(s)",
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
