/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./bottom-bar.module.scss";

import React from "react";
import { observer } from "mobx-react";
import { StatusBarRegistration, StatusBarRegistry } from "../../../extensions/registries";
import { cssNames } from "../../utils";

@observer
export class BottomBar extends React.Component {
  renderRegisteredItem(registration: StatusBarRegistration) {
    const { item } = registration;

    if (item) {
      return typeof item === "function" ? item() : item;
    }

    return <registration.components.Item />;
  }

  renderRegisteredItems() {
    const items = StatusBarRegistry.getInstance().getItems();

    if (!Array.isArray(items)) {
      return null;
    }

    items.sort(function sortLeftPositionFirst(a, b) {
      return a.components?.position?.localeCompare(b.components?.position);
    });

    return (
      <>
        {items.map((registration, index) => {
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
