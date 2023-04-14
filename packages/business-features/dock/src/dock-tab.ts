import type React from "react";
import { getInjectionToken } from "@ogre-tools/injectable";

export type DockTab = {
  id: string;
  TitleComponent: React.ComponentType;
  ContentComponent: React.ComponentType;
};

export const dockTabInjectionToken = getInjectionToken<DockTab>({
  id: "dock-tab-injection-token",
});
