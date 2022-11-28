/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import styles from "../../top-bar.module.scss";
import openAppContextMenuInjectable from "./open-app-context-menu/open-app-context-menu.injectable";

interface Dependencies {
  openAppContextMenu: () => void;
}

const NonInjectedContextMenu = ({ openAppContextMenu }: Dependencies) => (
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
);

export const ContextMenu = withInjectables<Dependencies>(
  NonInjectedContextMenu,

  {
    getProps: (di) => ({
      openAppContextMenu: di.inject(openAppContextMenuInjectable),
    }),
  },
);
