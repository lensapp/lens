/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import { pipeline } from "@ogre-tools/fp";

import {
  filter,
  flatMap,
  identity,
  invokeMap,
  isEmpty,
  map,
  orderBy,
  overSome,
  some,
} from "lodash/fp";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";

export interface SidebarItemRegistration {
  id: string;
  parentId: string | null;
  title: React.ReactNode;
  onClick: () => void;
  getIcon?: () => React.ReactNode;
  isActive?: IComputedValue<boolean>;
  isVisible?: IComputedValue<boolean>;
  orderNumber: number;
  extension?: LensRendererExtension;
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
    const extensions = di.inject(rendererExtensionsInjectable);

    return computed((): HierarchicalSidebarItem[] => {
      const enabledExtensions = extensions.get();

      const sidebarItemRegistrations = di.injectMany(
        sidebarItemsInjectionToken,
      );

      const registrations = pipeline(
        sidebarItemRegistrations,
        flatMap(dereference),

        filter(
          overSome([
            isNonExtensionSidebarItem,
            isEnabledExtensionSidebarItemFor(enabledExtensions),
          ]),
        ),
      );

      const getSidebarItemsHierarchy = (registrations: SidebarItemRegistration[]) => {
        const _getSidebarItemsHierarchy = (parentId: string | null): HierarchicalSidebarItem[] =>
          pipeline(
            registrations,

            filter((item) => item.parentId === parentId),

            map((registration) => {
              const children = _getSidebarItemsHierarchy(registration.id);

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

const isNonExtensionSidebarItem = (sidebarItem: SidebarItemRegistration) =>
  !sidebarItem.extension;

const isEnabledExtensionSidebarItemFor =
  (enabledExtensions: LensRendererExtension[]) =>
    (sidebarItem: SidebarItemRegistration) =>
      !!enabledExtensions.find((x) => x === sidebarItem.extension);

const dereference = (items: IComputedValue<SidebarItemRegistration[]>) =>
  items.get();

export default sidebarItemsInjectable;
