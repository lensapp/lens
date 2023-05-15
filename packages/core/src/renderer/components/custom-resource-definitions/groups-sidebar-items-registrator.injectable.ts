/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import { injectableDifferencingRegistratorWith } from "../../../common/utils/registrator-helper";
import { beforeClusterFrameStartsSecondInjectionToken } from "../../before-frame-starts/tokens";
import customResourceDefinitionGroupsSidebarItemsComputedInjectable from "./groups-sidebar-items-computed.injectable";

const customResourceDefinitionGroupsSidebarItemsRegistratorInjectable = getInjectable({
  id: "custom-resource-definition-groups-sidebar-items-registrator",
  instantiate: (di) => ({
    run: () => {
      const sidebarItems = di.inject(customResourceDefinitionGroupsSidebarItemsComputedInjectable);
      const injectableDifferencingRegistrator = injectableDifferencingRegistratorWith(di);

      reaction(
        () => sidebarItems.get(),
        injectableDifferencingRegistrator,
        { fireImmediately: true },
      );
    },
  }),
  injectionToken: beforeClusterFrameStartsSecondInjectionToken,
});

export default customResourceDefinitionGroupsSidebarItemsRegistratorInjectable;

