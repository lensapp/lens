// Extensions-api -> Register page menu items
import type { IconProps } from "../../renderer/components/icon";
import type React from "react";
import type { PageTarget, RegisteredPage } from "./page-registry";
import { RegisteredPageTarget } from ".";
import { LensRendererExtension } from "../core-api";
import { extensionLoader } from "../extension-loader";
import { registeredClusterPageMenus, registeredGlobalPageMenus } from "../lens-renderer-extension";

export interface PageMenuComponents {
  Icon: React.ComponentType<IconProps>;
}

export interface PageMenuRegistration {
  target?: PageTarget;
  title: React.ReactNode;
  components: PageMenuComponents;
}

export interface RegisteredPageMenuTarget {
  target: RegisteredPageTarget;
}

export type RegisteredPageMenu = PageMenuRegistration & RegisteredPageMenuTarget;

export interface ClusterPageMenuRegistration extends PageMenuRegistration {
  id?: string;
  parentId?: string;
}

export type RegisteredClusterPageMenu = ClusterPageMenuRegistration & RegisteredPageMenuTarget;

export function getRegisteredPageMenu<T extends PageMenuRegistration>({ target: { pageId, params } = {}, ...rest }: T, extensionName: string): T & RegisteredPageMenuTarget {
  const target: RegisteredPageTarget = {
    params,
    pageId,
    extensionName,
  };

  return { ...rest, target } as T & RegisteredPageMenuTarget;
}

export function getGlobalPageMenus(): RegisteredPageMenu[] {
  const extensions = extensionLoader.allEnabledInstances as LensRendererExtension[];

  return extensions.flatMap(ext => ext[registeredGlobalPageMenus]);
}

function getClusterPageMenus(): RegisteredClusterPageMenu[] {
  const extensions = extensionLoader.allEnabledInstances as LensRendererExtension[];

  return extensions.flatMap(ext => ext[registeredClusterPageMenus]);
}

export function getRootClusterPageMenus(): RegisteredClusterPageMenu[] {
  return getClusterPageMenus().filter(pageMenu => !pageMenu.parentId);
}

export function getChildClusterPageMenus(parentMenu: RegisteredClusterPageMenu): RegisteredClusterPageMenu[] {
  return getClusterPageMenus()
    .filter(pageMenu => (
      pageMenu.parentId === parentMenu.id
      && pageMenu.target.extensionName === parentMenu.target.extensionName
    ));
}

export function getClusterPageMenuByPage({ id: pageId, extensionName }: RegisteredPage): RegisteredClusterPageMenu {
  return getClusterPageMenus()
    .find(pageMenu => (
      pageMenu.target.pageId == pageId
      && pageMenu.target.extensionName === extensionName
    ));
}
