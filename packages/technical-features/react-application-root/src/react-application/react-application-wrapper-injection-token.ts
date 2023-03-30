import { getInjectionToken } from "@ogre-tools/injectable";
import type React from "react";

export type ReactApplicationWrapper = (Component: React.ComponentType) => React.ComponentType;

export const reactApplicationWrapperInjectionToken = getInjectionToken<ReactApplicationWrapper>({
  id: "react-application-wrapper-injection-token",
});
