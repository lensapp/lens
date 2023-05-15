/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { Icon } from "@k8slens/icon";
import topBarPrevEnabledInjectable from "./prev-enabled.injectable";
import goBackInjectable from "./go-back/go-back.injectable";
import { observer } from "mobx-react";

interface Dependencies {
  prevEnabled: IComputedValue<boolean>;
  goBack: () => void;
}

const NonInjectedNavigationToBack = observer(({
  prevEnabled,
  goBack,
}: Dependencies) => (
  <Icon
    data-testid="history-back"
    material="arrow_back"
    onClick={goBack}
    disabled={!prevEnabled.get()}
  />
));

export const NavigationToBack = withInjectables<Dependencies>(
  NonInjectedNavigationToBack,

  {
    getProps: (di) => ({
      prevEnabled: di.inject(topBarPrevEnabledInjectable),
      goBack: di.inject(goBackInjectable),
    }),
  },
);
