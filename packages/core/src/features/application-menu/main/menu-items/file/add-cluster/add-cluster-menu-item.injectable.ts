/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import navigateToAddClusterInjectable from "../../../../../../common/front-end-routing/routes/add-cluster/navigate-to-add-cluster.injectable";

const addClusterMenuItemInjectable = getInjectable({
  id: "add-cluster-application-menu-item",

  instantiate: (di) => {
    const navigateToAddCluster = di.inject(navigateToAddClusterInjectable);

    return {
      kind: "clickable-menu-item" as const,
      parentId: "file",
      id: "add-cluster",
      orderNumber: 10,
      label: "Add Cluster",
      keyboardShortcut: "CmdOrCtrl+Shift+A",

      onClick: () => {
        navigateToAddCluster();
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default addClusterMenuItemInjectable;
