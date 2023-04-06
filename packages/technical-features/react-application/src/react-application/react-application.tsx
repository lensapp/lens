import type { DiContainerForInjection } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { DiContextProvider } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import {
  ReactApplicationHigherOrderComponent,
  reactApplicationHigherOrderComponentInjectionToken,
} from "./react-application-higher-order-component-injection-token";

import { ReactApplicationContent } from "./react-application-content";

interface ReactApplicationProps {
  di: DiContainerForInjection;
}

const render = (components: ReactApplicationHigherOrderComponent[]) => {
  const [Component, ...rest] = components;

  if (!Component) {
    return null;
  }

  return <Component>{render(rest)}</Component>;
};

export const ReactApplication = observer(({ di }: ReactApplicationProps) => {
  const computedInjectMany = di.inject(computedInjectManyInjectable);

  const higherOrderComponents = computedInjectMany(reactApplicationHigherOrderComponentInjectionToken);

  const Components = [...higherOrderComponents.get(), ReactApplicationContent];

  return <DiContextProvider value={{ di }}>{render(Components)}</DiContextProvider>;
});
