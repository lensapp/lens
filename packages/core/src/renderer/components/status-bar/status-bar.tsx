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
import type { IComputedValue, IObservableValue } from "mobx";
import type { StatusBarStatus } from "./current-status.injectable";
import statusBarCurrentStatusInjectable from "./current-status.injectable";
import { cssNames } from "@k8slens/utilities";

export interface StatusBarProps {}

interface Dependencies {
  items: IComputedValue<StatusBarItems>;
  status: IObservableValue<StatusBarStatus>;
}

const NonInjectedStatusBar = observer(({
  items,
  status,
}: Dependencies & StatusBarProps) => {
  const { left, right } = items.get();
  const barStatus = status.get();
  const barStyle = barStatus === "default"
    ? undefined
    : styles[`status-${barStatus}`];

  return (
    <div className={cssNames(styles.StatusBar, barStyle)} data-testid="status-bar">
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
    ...props,
    items: di.inject(statusBarItemsInjectable),
    status: di.inject(statusBarCurrentStatusInjectable),
  }),
});
