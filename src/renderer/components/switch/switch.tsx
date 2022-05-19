/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./switch.module.scss";

import type { ChangeEvent, HTMLProps } from "react";
import React from "react";
import { cssNames } from "../../utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import captureWithIdInjectable from "../../telemetry/capture-with-id.injectable";

export interface SwitchProps extends Omit<HTMLProps<HTMLInputElement>, "onChange"> {
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
}

interface Dependencies {
  captureChange: (id: string, action: string) => void;
}

function NonInjectedSwitch({ children, disabled, onChange, captureChange, ...props }: SwitchProps & Dependencies) {
  return (
    <label className={cssNames(styles.Switch, { [styles.disabled]: disabled })} data-testid="switch">
      {children}
      <input
        type="checkbox"
        role="switch"
        disabled={disabled}
        onChange={(event) =>{
          onChange?.(event.target.checked, event);

          if (children) {
            captureChange(children.toString(), `Switch ${props.checked ? "On" : "Off"}`);
          }
        }}
        {...props}
      />
    </label>
  );
}

export const Switch = withInjectables<Dependencies, SwitchProps>(
  NonInjectedSwitch,

  {
    getProps: (di, props) => ({
      captureChange: di.inject(captureWithIdInjectable),
      ...props,
    }),
  },
);
