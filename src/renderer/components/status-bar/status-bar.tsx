/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./status-bar.module.scss";

import React from "react";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import registeredStatusBarItemsInjectable, { RegisteredStatusBarItems } from "./registered-status-bar-items.injectable";
import type { IComputedValue } from "mobx";

export interface StatusBarProps {}

interface Dependencies {
  items: IComputedValue<RegisteredStatusBarItems>
}

const NonInjectedStatusBar = observer(({ items }: Dependencies & StatusBarProps) => {
  const { left, right } = items.get();

  return (
    <div className={styles.StatusBar}>
      <div className={styles.leftSide}>
        {left.map((Item, index) => (
          <div className={styles.item} key={index}>
            <Item />
          </div>
        ))}
      </div>
      <div className={styles.rightSide}>
        {right.map((Item, index) => (
          <div className={styles.item} key={index}>
            <Item />
          </div>
        ))}
      </div>
    </div>
  );

});

export const StatusBar = withInjectables<Dependencies, StatusBarProps>(NonInjectedStatusBar, {
  getProps: (di, props) => ({
    items: di.inject(registeredStatusBarItemsInjectable),
    ...props,
  }),
});
