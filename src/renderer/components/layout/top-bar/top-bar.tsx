/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./top-bar.module.scss";
import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react";
import type { IComputedValue } from "mobx";
import { Icon } from "../../icon";
import { observable } from "mobx";
import { ipcRendererOn } from "../../../../common/ipc";
import { watchHistoryState } from "../../../remote-helpers/history-updater";
import { cssNames } from "../../../utils";
import topBarItemsInjectable from "./top-bar-items/top-bar-items.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { TopBarRegistration } from "./top-bar-registration";
import { emitOpenAppMenuAsContextMenu, requestWindowAction } from "../../../ipc";
import { WindowAction } from "../../../../common/ipc/window";
import isLinuxInjectable from "../../../../common/vars/is-linux.injectable";
import isWindowsInjectable from "../../../../common/vars/is-windows.injectable";
import type { NavigateToCatalog } from "../../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import navigateToCatalogInjectable from "../../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import catalogRouteInjectable from "../../../../common/front-end-routing/routes/catalog/catalog-route.injectable";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";

interface Dependencies {
  navigateToCatalog: NavigateToCatalog;
  catalogRouteIsActive: IComputedValue<boolean>;
  items: IComputedValue<TopBarRegistration[]>;
  isWindows: boolean;
  isLinux: boolean;
}

const prevEnabled = observable.box(false);
const nextEnabled = observable.box(false);

ipcRendererOn("history:can-go-back", (event, state: boolean) => {
  prevEnabled.set(state);
});

ipcRendererOn("history:can-go-forward", (event, state: boolean) => {
  nextEnabled.set(state);
});

const NonInjectedTopBar = observer(({
  items,
  navigateToCatalog,
  catalogRouteIsActive,
  isWindows,
  isLinux,
}: Dependencies) => {
  const elem = useRef<HTMLDivElement | null>(null);

  const openAppContextMenu = () => {
    emitOpenAppMenuAsContextMenu();
  };

  const goHome = () => {
    navigateToCatalog();
  };

  const goBack = () => {
    requestWindowAction(WindowAction.GO_BACK);
  };

  const goForward = () => {
    requestWindowAction(WindowAction.GO_FORWARD);
  };

  const windowSizeToggle = (evt: React.MouseEvent) => {
    if (elem.current === evt.target) {
      toggleMaximize();
    }
  };

  const minimizeWindow = () => {
    requestWindowAction(WindowAction.MINIMIZE);
  };

  const toggleMaximize = () => {
    requestWindowAction(WindowAction.TOGGLE_MAXIMIZE);
  };

  const closeWindow = () => {
    requestWindowAction(WindowAction.CLOSE);
  };

  useEffect(() => watchHistoryState(), []);

  return (
    <div
      className={styles.topBar}
      onDoubleClick={windowSizeToggle}
      ref={elem}
    >
      <div className={styles.items}>
        {(isWindows || isLinux) && (
          <div className={styles.winMenu}>
            <div onClick={openAppContextMenu} data-testid="window-menu">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                shapeRendering="crispEdges"
              >
                <path fill="currentColor" d="M0,8.5h12v1H0V8.5z" />
                <path fill="currentColor" d="M0,5.5h12v1H0V5.5z" />
                <path fill="currentColor" d="M0,2.5h12v1H0V2.5z" />
              </svg>
            </div>
          </div>
        )}
        <Icon
          data-testid="home-button"
          material="home"
          onClick={goHome}
          disabled={catalogRouteIsActive.get()}
        />
        <Icon
          data-testid="history-back"
          material="arrow_back"
          onClick={goBack}
          disabled={!prevEnabled.get()}
        />
        <Icon
          data-testid="history-forward"
          material="arrow_forward"
          onClick={goForward}
          disabled={!nextEnabled.get()}
        />
      </div>
      <div className={styles.items}>
        {renderRegisteredItems(items.get())}
        {(isWindows || isLinux) && (
          <div className={cssNames(styles.windowButtons, { [styles.linuxButtons]: isLinux })}>
            <div
              className={styles.minimize}
              data-testid="window-minimize"
              onClick={minimizeWindow}
            >
              <svg shapeRendering="crispEdges" viewBox="0 0 12 12">
                <rect
                  fill="currentColor"
                  width="10"
                  height="1"
                  x="1"
                  y="9" 
                />
              </svg>
            </div>
            <div
              className={styles.maximize}
              data-testid="window-maximize"
              onClick={toggleMaximize}
            >
              <svg shapeRendering="crispEdges" viewBox="0 0 12 12">
                <rect
                  width="9"
                  height="9"
                  x="1.5"
                  y="1.5"
                  fill="none"
                  stroke="currentColor" 
                />
              </svg>
            </div>
            <div
              className={styles.close}
              data-testid="window-close"
              onClick={closeWindow}
            >
              <svg shapeRendering="crispEdges" viewBox="0 0 12 12">
                <polygon fill="currentColor" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const renderRegisteredItems = (items: TopBarRegistration[]) => (
  items.map((registration, index) => {
    if (!registration?.components?.Item) {
      return null;
    }

    return <registration.components.Item key={index} />;
  })
);

export const TopBar = withInjectables<Dependencies>(
  NonInjectedTopBar,
  {
    getProps: (di) => {
      const catalogRoute = di.inject(catalogRouteInjectable);

      return {
        navigateToCatalog: di.inject(navigateToCatalogInjectable),
        items: di.inject(topBarItemsInjectable),
        isLinux: di.inject(isLinuxInjectable),
        isWindows: di.inject(isWindowsInjectable),

        catalogRouteIsActive: di.inject(
          routeIsActiveInjectable,
          catalogRoute,
        ),
      };
    },
  },
);
