/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { byOrderNumber } from "../../../common/utils/composable-responsibilities/orderable/orderable";
import type { SetRequired } from "type-fest";
import type { StrictReactNode } from "@k8slens/utilities";

export interface SidebarItemRegistration {
  id: string;
  parentId: string | null;
  title: StrictReactNode;
  onClick: () => void;
  getIcon?: () => StrictReactNode;
  isActive?: IComputedValue<boolean>;
  isVisible?: IComputedValue<boolean>;
  orderNumber: number;
}

export const sidebarItemsInjectionToken = getInjectionToken<
  IComputedValue<SidebarItemRegistration[]>
>({ id: "sidebar-items-injection-token" });

export interface HierarchicalSidebarItem extends SetRequired<SidebarItemRegistration, "isActive" | "isVisible"> {
  children: HierarchicalSidebarItem[];
}

const sidebarItemsInjectable = getInjectable({
  id: "sidebar-items",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const sidebarItemRegistrations = computedInjectMany(sidebarItemsInjectionToken);

    return computed((): HierarchicalSidebarItem[] => {
      const registrations = sidebarItemRegistrations
        .get()
        .flatMap(reg => reg.get());

      const getSidebarItemsHierarchy = (registrations: SidebarItemRegistration[]) => {
        const impl = (parentId: string | null): HierarchicalSidebarItem[] => (
          registrations
            .filter((item) => item.parentId === parentId)
            .map(({
              isActive = computed(() => false),
              isVisible = computed(() => true),
              ...registration
            }) => {
              const children = impl(registration.id);

              return {
                ...registration,
                children,
                isVisible,
                isActive: computed(() => {
                  if (children.length === 0) {
                    return isActive.get();
                  }

                  return children.some(child => child.isActive.get());
                }),
              };
            })
            .filter(({ isVisible }) => isVisible.get())
            .sort(byOrderNumber)
        );

        return impl(null);
      };

      return getSidebarItemsHierarchy(registrations);
    });
  },
});

export default sidebarItemsInjectable;
