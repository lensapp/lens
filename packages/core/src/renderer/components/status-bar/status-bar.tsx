/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./status-bar.module.scss";

import React from "react";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { StatusBarItems } from "./status-bar-items.injectable";
import statusBarItemsInjectable from "./status-bar-items.injectable";
import type { IComputedValue } from "mobx";

export interface StatusBarProps {}

interface Dependencies {
  items: IComputedValue<StatusBarItems>;
}

const NonInjectedStatusBar = observer(({ items }: Dependencies & StatusBarProps) => {
  const { left, right } = items.get();

  return (
    <div className={styles.StatusBar} data-testid="status-bar">
      <div className={styles.leftSide} data-testid="status-bar-left">
        {left.map((Item, index) => (
          <div
            className={styles.item}
            key={index}
            data-origin={Item.origin}>
            {<Item.component/>}
          </div>
        ))}
      </div>
      <div className={styles.rightSide} data-testid="status-bar-right">
        {right.map((Item, index) => (
          <div
            className={styles.item}
            key={index}
            data-origin={Item.origin}>
            {<Item.component/>}
          </div>
        ))}
      </div>
    </div>
  );

});

export const StatusBar = withInjectables<Dependencies, StatusBarProps>(NonInjectedStatusBar, {
  getProps: (di, props) => ({
    items: di.inject(statusBarItemsInjectable),
    ...props,
  }),
});
