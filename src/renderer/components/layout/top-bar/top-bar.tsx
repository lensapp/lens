/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./top-bar.module.scss";
import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import toggleMaximizeWindowInjectable from "./toggle-maximize-window/toggle-maximize-window.injectable";
import watchHistoryStateInjectable from "../../../remote-helpers/watch-history-state.injectable";
import topBarItemsInjectable from "./top-bar-items/top-bar-items.injectable";
import type { TopBarItem } from "./top-bar-items/top-bar-item-injection-token";
import welcomeRouteInjectable from "../../../../common/front-end-routing/routes/welcome/welcome-route.injectable";
import navigateToWelcomeInjectable from "../../../../common/front-end-routing/routes/welcome/navigate-to-welcome.injectable";

interface Dependencies {
  items: IComputedValue<TopBarItem[]>;
  toggleMaximizeWindow: () => void;
  watchHistoryState: () => () => void;
}

const NonInjectedTopBar = observer(
  ({
    items,
    toggleMaximizeWindow,
    watchHistoryState,
  }: Dependencies) => {
    const elem = useRef<HTMLDivElement | null>(null);

    const windowSizeToggle = (evt: React.MouseEvent) => {
      if (elem.current === evt.target) {
        toggleMaximizeWindow();
      }
    };

    useEffect(() => watchHistoryState(), []);

    return (
      <div
        className={styles.topBar}
        onDoubleClick={windowSizeToggle}
        ref={elem}
      >
        <div className={styles.items}>
          {items.get().map((item) => {
            const Component = item.Component;

            return <Component key={item.id} />;
          })}
        </div>
      </div>
    );
  },
);

export const TopBar = withInjectables<Dependencies>(NonInjectedTopBar, {
  getProps: (di) => ({
    items: di.inject(topBarItemsInjectable),
    toggleMaximizeWindow: di.inject(toggleMaximizeWindowInjectable),
    watchHistoryState: di.inject(watchHistoryStateInjectable),
  }),
});
