// Extensions-api -> Custom page registration

import type React from "react";
import type { RouteProps } from "react-router";
import type { IconProps } from "../../renderer/components/icon";
import type { IClassName } from "../../renderer/utils";
import type { TabRoute } from "../../renderer/components/layout/tab-layout";
import { BaseRegistry } from "./base-registry";

export interface PageRegistration extends RouteProps {
  className?: IClassName;
  url?: string; // initial url to be used for building menus and tabs, otherwise "path" applied by default
  title?: React.ReactNode; // used in sidebar's & tabs-layout if provided
  hideInMenu?: boolean; // hide element within app's navigation menu
  subPages?: (PageRegistration & TabRoute)[];
  components: PageComponents;
}

export interface PageComponents {
  Page: React.ComponentType<any>;
  MenuIcon?: React.ComponentType<IconProps>;
}

export class GlobalPageRegistry extends BaseRegistry<PageRegistration> {
}

export class ClusterPageRegistry extends BaseRegistry<PageRegistration> {
}

export const globalPageRegistry = new GlobalPageRegistry();
export const clusterPageRegistry = new ClusterPageRegistry();
