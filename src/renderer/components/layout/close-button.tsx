/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./close-button.module.scss";

import type { HTMLAttributes } from "react";
import React from "react";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import captureWithIdInjectable from "../../telemetry/capture-with-id.injectable";

export interface CloseButtonProps extends HTMLAttributes<HTMLDivElement> {
}

interface Dependencies {
  capture: (id: string, action: string) => void;
}

function NonInjectedCloseButton(props: CloseButtonProps & Dependencies) {
  const { capture, ...rest } = props;

  return (
    <div
      {...rest}
      onClick={(e) => {
        capture(`${window.location.pathname}`, "Close Button Click");
        props?.onClick?.(e);
      }}>
      <div
        className={styles.closeButton}
        role="button"
        aria-label="Close"
      >
        <Icon material="close" className={styles.icon}/>
      </div>
      <div className={styles.esc} aria-hidden="true">
        ESC
      </div>
    </div>
  );
}

export const CloseButton = withInjectables<Dependencies, CloseButtonProps>(
  NonInjectedCloseButton,

  {
    getProps: (di, props) => ({
      capture: di.inject(captureWithIdInjectable),
      ...props,
    }),
  },
);
