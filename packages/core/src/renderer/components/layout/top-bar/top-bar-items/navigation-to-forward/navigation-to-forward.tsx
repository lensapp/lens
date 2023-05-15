/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { Icon } from "@k8slens/icon";
import topBarNextEnabledInjectable from "./next-enabled.injectable";
import goForwardInjectable from "./go-forward/go-forward.injectable";
import { observer } from "mobx-react";

interface Dependencies {
  nextEnabled: IComputedValue<boolean>;
  goForward: () => void;
}

const NonInjectedNavigationToForward = observer(({
  nextEnabled,
  goForward,
}: Dependencies) => (
  <Icon
    data-testid="history-forward"
    material="arrow_forward"
    onClick={goForward}
    disabled={!nextEnabled.get()}
  />
));

export const NavigationToForward = withInjectables<Dependencies>(
  NonInjectedNavigationToForward,

  {
    getProps: (di) => ({
      nextEnabled: di.inject(topBarNextEnabledInjectable),
      goForward: di.inject(goForwardInjectable),
    }),
  },
);
