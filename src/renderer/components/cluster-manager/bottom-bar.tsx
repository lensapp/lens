/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./bottom-bar.module.scss";

import React from "react";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import bottomBarItemsInjectable from "./bottom-bar-items.injectable";
import type { IComputedValue } from "mobx";
import type { StatusBarRegistration } from "./status-bar-registration";

interface Dependencies {
  items: IComputedValue<StatusBarRegistration[]>
}

@observer
class NonInjectedBottomBar extends React.Component<Dependencies> {
  renderRegisteredItem(registration: StatusBarRegistration) {
    const { item } = registration;

    if (item) {
      return typeof item === "function" ? item() : item;
    }

    return <registration.components.Item />;
  }

  renderRegisteredItems() {
    return (
      <>
        {this.props.items.get().map((registration, index) => {
          if (!registration?.item && !registration?.components?.Item) {
            return null;
          }

          return (
            <div
              className={cssNames(styles.item, {
                [styles.onLeft]: registration.components?.position == "left",
                [styles.onRight]: registration.components?.position != "left",
              })}
              key={index}
            >
              {this.renderRegisteredItem(registration)}
            </div>
          );
        })}
      </>
    );
  }

  render() {
    return (
      <div className={styles.BottomBar}>
        {this.renderRegisteredItems()}
      </div>
    );
  }
}

export const BottomBar = withInjectables<Dependencies>(
  NonInjectedBottomBar,

  {
    getProps: (di, props) => ({
      items: di.inject(bottomBarItemsInjectable),
      ...props,
    }),
  },
);
