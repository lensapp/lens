import { getInjectionToken } from "@ogre-tools/injectable";
import type React from "react";

export type ReactApplicationHigherOrderComponent = React.ComponentType<{
  children: React.ReactNode;
}>;

export const reactApplicationHigherOrderComponentInjectionToken =
  getInjectionToken<ReactApplicationHigherOrderComponent>({
    id: "react-application-higher-order-component-injection-token",
  });
