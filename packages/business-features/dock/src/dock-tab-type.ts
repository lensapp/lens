import type React from "react";
import { getInjectionToken } from "@ogre-tools/injectable";

export type DockTabType = {
  id: string;
  TitleComponent: React.ComponentType;
  ContentComponent: React.ComponentType;
};

export const dockTabTypeInjectionToken = getInjectionToken<DockTabType>({
  id: "dock-tab-type-injection-token",
});
