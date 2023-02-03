/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import { pipeline } from "@ogre-tools/fp";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import {
  filter,
  flatMap,
  identity,
  invokeMap,
  isEmpty,
  map,
  orderBy,
  some,
} from "lodash/fp";
import sidebarStorageInjectable, { SidebarStorageState } from "./sidebar-storage/sidebar-storage.injectable";
import type { StorageLayer } from "../../utils";

export interface SidebarItemRegistration {
  id: string;
  parentId: string | null;
  title: React.ReactNode;
  onClick: () => void;
  getIcon?: () => React.ReactNode;
  isActive?: IComputedValue<boolean>;
  isVisible?: IComputedValue<boolean>;
  orderNumber: number;
}

export const sidebarItemsInjectionToken = getInjectionToken<
  IComputedValue<SidebarItemRegistration[]>
>({ id: "sidebar-items-injection-token" });

export interface HierarchicalSidebarItem {
  registration: SidebarItemRegistration;
  children: HierarchicalSidebarItem[];
  isActive: IComputedValue<boolean>;
}

const sidebarItemsInjectable = getInjectable({
  id: "sidebar-items",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const sidebarStorage: StorageLayer<SidebarStorageState> = di.inject(sidebarStorageInjectable)
    const sidebarItemRegistrations = computedInjectMany(sidebarItemsInjectionToken);

    return computed((): HierarchicalSidebarItem[] => {
      const registrations = pipeline(
        sidebarItemRegistrations.get(),
        flatMap(dereference),
      );

      const getSidebarItemsHierarchy = (registrations: SidebarItemRegistration[]) => {
        const _getSidebarItemsHierarchy = (parentId: string | null): HierarchicalSidebarItem[] =>
          pipeline(
            registrations,

            filter((item) => item.parentId === parentId),

            map((registration) => {
              const children = _getSidebarItemsHierarchy(registration.id);

              const parentExpanded = () => Boolean(sidebarStorage.get().expanded[registration.id])

              return {
                registration,
                children,

                isActive: computed(() => {
                  if (isEmpty(children)) {
                    return registration.isActive ? registration.isActive.get() : false;
                  }

                  return pipeline(
                    children,
                    invokeMap("isActive.get"),
                    some(identity),
                    (identityFound) => identityFound && !parentExpanded(),
                  );
                }),
              };
            }),

            filter(item => item.registration.isVisible?.get() ?? true),

            (items) =>
              orderBy(
                ["registration.orderNumber"],
                ["asc"],
                items,
              ),
          );

        return _getSidebarItemsHierarchy(null);
      };

      return getSidebarItemsHierarchy(registrations);
    });
  },
});

const dereference = (items: IComputedValue<SidebarItemRegistration[]>) =>
  items.get();

export default sidebarItemsInjectable;
