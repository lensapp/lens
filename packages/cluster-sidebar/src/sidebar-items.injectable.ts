/* eslint-disable prettier/prettier */

import { getInjectable } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { HierarchicalSidebarItem, sidebarItemInjectionToken, SidebarItemRegistration } from "./tokens";
import { computed } from "mobx";
import { byOrderNumber } from "@k8slens/utilities";

const getSidebarItemsHierarchy = (
  registrations: SidebarItemRegistration[],
  parentId: string | null,
): HierarchicalSidebarItem[] => (
  registrations
    .filter((item) => item.parentId === parentId)
    .map(({
      isActive,
      isVisible,
      ...registration
    }) => {
      const children = getSidebarItemsHierarchy(registrations, registration.id);

      return {
        ...registration,
        children,
        isVisible: computed(() => {
          if (children.length === 0) {
            if (isVisible) {
              return isVisible.get();
            }

            return true;
          }

          return children.some((child) => child.isVisible.get());
        }),
        isActive: computed(() => {
          if (children.length === 0) {
            if (isActive) {
              return isActive.get();
            }

            return false;
          }

          return children.some((child) => child.isActive.get());
        }),
      };
    })
    .sort(byOrderNumber)
);

const sidebarItemsInjectable = getInjectable({
  id: "sidebar-items",
  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const sidebarItemRegistrations = computedInjectMany(sidebarItemInjectionToken);

    return computed(() => getSidebarItemsHierarchy(sidebarItemRegistrations.get(), null));
  },
});

export default sidebarItemsInjectable;
