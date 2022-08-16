/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { Icon } from "../../../../icon";
import navigateToCatalogInjectable from "../../../../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import routeIsActiveInjectable from "../../../../../routes/route-is-active.injectable";
import catalogRouteInjectable from "../../../../../../common/front-end-routing/routes/catalog/catalog-route.injectable";
import { observer } from "mobx-react";

interface Dependencies {
  catalogRouteIsActive: IComputedValue<boolean>;
  goHome: () => void;
}

const NonInjectedNavigationToHome = observer(({
  catalogRouteIsActive,
  goHome,
}: Dependencies) => (
  <Icon
    data-testid="home-button"
    material="home"
    onClick={goHome}
    disabled={catalogRouteIsActive.get()}
  />
));

export const NavigationToHome = withInjectables<Dependencies>(
  NonInjectedNavigationToHome,

  {
    getProps: (di) => ({
      catalogRouteIsActive: di.inject(
        routeIsActiveInjectable,
        di.inject(catalogRouteInjectable),
      ),

      goHome: di.inject(navigateToCatalogInjectable),
    }),
  },
);
