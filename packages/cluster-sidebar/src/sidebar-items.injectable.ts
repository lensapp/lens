import { getInjectable, InjectionInstanceWithMeta } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { SidebarItemDeclaration, sidebarItemInjectionToken, SidebarItemRegistration } from "./tokens";
import { computed } from "mobx";
import { byOrderNumber } from "@k8slens/utilities";

const getSidebarItemsHierarchy = (
  registrations: InjectionInstanceWithMeta<SidebarItemRegistration>[],
  parentId: string | null,
): SidebarItemDeclaration[] =>
  registrations
    .filter(({ instance }) => instance.parentId === parentId)
    .map(({ instance: { isActive, isVisible, ...registration }, meta: { id } }) => {
      const children = getSidebarItemsHierarchy(registrations, id);

      return {
        ...registration,
        id,
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
    .sort(byOrderNumber);

const sidebarItemsInjectable = getInjectable({
  id: "sidebar-items",
  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const sidebarItemRegistrations = computedInjectMany(sidebarItemInjectionToken);

    return computed(() => {
      void sidebarItemRegistrations.get();

      return getSidebarItemsHierarchy(di.injectManyWithMeta(sidebarItemInjectionToken), null);
    });
  },
});

export default sidebarItemsInjectable;
