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
      parentId: "file",
      id: "add-cluster",
      orderNumber: 10,
      label: "Add Cluster",
      accelerator: "CmdOrCtrl+Shift+A",

      click: () => {
        navigateToAddCluster();
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default addClusterMenuItemInjectable;
