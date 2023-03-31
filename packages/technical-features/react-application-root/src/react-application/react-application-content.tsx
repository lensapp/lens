import { withInjectables } from "@ogre-tools/injectable-react";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import React from "react";
import {
  ReactApplicationChildren,
  reactApplicationChildrenInjectionToken,
} from "./react-application-children-injection-token";
import type { IComputedValue } from "mobx";
import { observer, Observer } from "mobx-react";

type Dependencies = { contents: IComputedValue<ReactApplicationChildren[]> };

const NonInjectedContent = observer(({ contents }: Dependencies) => (
  <>
    {contents.get().map((child) => (
      <Observer key={child.id}>{() => (child.enabled.get() ? <child.Component /> : null)}</Observer>
    ))}
  </>
));

export const ReactApplicationContent = withInjectables<Dependencies>(
  NonInjectedContent,

  {
    getProps: (di) => ({
      contents: di.inject(computedInjectManyInjectable)(reactApplicationChildrenInjectionToken),
    }),
  },
);
