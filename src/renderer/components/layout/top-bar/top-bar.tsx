/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./top-bar.module.scss";
import React, { useEffect, useMemo, useRef } from "react";
import { observer } from "mobx-react";
import type { IComputedValue } from "mobx";
import { Icon } from "../../icon";
import { webContents, getCurrentWindow } from "@electron/remote";
import { observable } from "mobx";
import { broadcastMessage, ipcRendererOn } from "../../../../common/ipc";
import { watchHistoryState } from "../../../remote-helpers/history-updater";
import { isActiveRoute, navigate } from "../../../navigation";
import { catalogRoute, catalogURL } from "../../../../common/routes";
import { IpcMainWindowEvents } from "../../../../main/windows/manager";
import { isLinux, isWindows } from "../../../../common/vars";
import { cssNames } from "../../../utils";
import topBarItemsInjectable from "./top-bar-items/top-bar-items.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { TopBarRegistration } from "./top-bar-registration";

interface Props extends React.HTMLAttributes<any> {}

interface Dependencies {
  items: IComputedValue<TopBarRegistration[]>;
}

const prevEnabled = observable.box(false);
const nextEnabled = observable.box(false);

ipcRendererOn("history:can-go-back", (event, state: boolean) => {
  prevEnabled.set(state);
});

ipcRendererOn("history:can-go-forward", (event, state: boolean) => {
  nextEnabled.set(state);
});

const NonInjectedTopBar = (({ items, children, ...rest }: Props & Dependencies) => {
  const elem = useRef<HTMLDivElement>();
  const window = useMemo(() => getCurrentWindow(), []);

  const openContextMenu = () => {
    broadcastMessage(IpcMainWindowEvents.OPEN_CONTEXT_MENU);
  };

  const goHome = () => {
    navigate(catalogURL());
  };

  const goBack = () => {
    webContents.getAllWebContents().find((webContent) => webContent.getType() === "window")?.goBack();
  };

  const goForward = () => {
    webContents.getAllWebContents().find((webContent) => webContent.getType() === "window")?.goForward();
  };

  const windowSizeToggle = (evt: React.MouseEvent) => {
    if (elem.current != evt.target) {
      // Skip clicking on child elements
      return;
    }

    toggleMaximize();
  };

  const minimizeWindow = () => {
    window.minimize();
  };

  const toggleMaximize = () => {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  };

  const closeWindow = () => {
    window.close();
  };

  useEffect(() => {
    const disposer = watchHistoryState();

    return () => disposer();
  }, []);

  return (
    <div className={styles.topBar} onDoubleClick={windowSizeToggle} ref={elem} {...rest}>
      <div className={styles.tools}>
        {(isWindows || isLinux) && (
          <div className={styles.winMenu}>
            <div onClick={openContextMenu} data-testid="window-menu">
              <svg width="12" height="12" viewBox="0 0 12 12" shapeRendering="crispEdges"><path fill="currentColor" d="M0,8.5h12v1H0V8.5z"/><path fill="currentColor" d="M0,5.5h12v1H0V5.5z"/><path fill="currentColor" d="M0,2.5h12v1H0V2.5z"/></svg>
            </div>
          </div>
        )}
        <Icon
          data-testid="home-button"
          material="home"
          className="ml-4"
          onClick={goHome}
          disabled={isActiveRoute(catalogRoute)}
        />
        <Icon
          data-testid="history-back"
          material="arrow_back"
          className="ml-5"
          onClick={goBack}
          disabled={!prevEnabled.get()}
        />
        <Icon
          data-testid="history-forward"
          material="arrow_forward"
          className="ml-5"
          onClick={goForward}
          disabled={!nextEnabled.get()}
        />
      </div>
      <div className={styles.controls}>
        {renderRegisteredItems(items.get())}
        {children}
        {(isWindows || isLinux) && (
          <div className={cssNames(styles.windowButtons, { [styles.linuxButtons]: isLinux })}>
            <div className={styles.minimize} data-testid="window-minimize" onClick={minimizeWindow}>
              <svg shapeRendering="crispEdges" viewBox="0 0 12 12"><rect fill="currentColor" width="10" height="1" x="1" y="9"></rect></svg></div>
            <div className={styles.maximize} data-testid="window-maximize" onClick={toggleMaximize}>
              <svg shapeRendering="crispEdges" viewBox="0 0 12 12"><rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor"></rect></svg>
            </div>
            <div className={styles.close} data-testid="window-close" onClick={closeWindow}>
              <svg shapeRendering="crispEdges" viewBox="0 0 12 12"><polygon fill="currentColor" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"></polygon></svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const renderRegisteredItems = (items: TopBarRegistration[]) => (
  <div>
    {items.map((registration, index) => {
      if (!registration?.components?.Item) {
        return null;
      }

      return (
        <div key={index}>
          <registration.components.Item />
        </div>
      );
    })}
  </div>
);



export const TopBar = withInjectables(observer(NonInjectedTopBar), {
  getProps: (di, props) => ({
    items: di.inject(topBarItemsInjectable),

    ...props,
  }),
});
