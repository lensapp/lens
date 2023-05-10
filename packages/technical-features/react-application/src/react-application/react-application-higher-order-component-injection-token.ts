import type { StrictReactNode } from "@k8slens/utilities";
import { getInjectionToken } from "@ogre-tools/injectable";
import type React from "react";

export type ReactApplicationHigherOrderComponent = React.ComponentType<{
  children: StrictReactNode;
}>;

export const reactApplicationHigherOrderComponentInjectionToken =
  getInjectionToken<ReactApplicationHigherOrderComponent>({
    id: "react-application-higher-order-component-injection-token",
  });
