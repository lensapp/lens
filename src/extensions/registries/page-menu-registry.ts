// Extensions-api -> Register page menu items

import type React from "react";
import type { IconProps } from "../../renderer/components/icon";
import { BaseRegistry } from "./base-registry";

export interface PageMenuRegistration {
  url: string;
  title: React.ReactNode;
  components: PageMenuComponents;
}

export interface PageMenuRegistrationCluster extends PageMenuRegistration {
  subMenus?: Omit<PageMenuRegistration, "components" | "subMenus">[];
}

export interface PageMenuComponents {
  Icon: React.ComponentType<IconProps>;
}

export class PageMenuRegistry<T extends PageMenuRegistration> extends BaseRegistry<T> {
}

export const globalPageMenuRegistry = new PageMenuRegistry<PageMenuRegistration>();
export const clusterPageMenuRegistry = new PageMenuRegistry<PageMenuRegistrationCluster>();
