/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./switch.module.scss";

import React, { ChangeEvent, HTMLProps } from "react";
import { cssNames } from "../../utils";

interface Props extends Omit<HTMLProps<HTMLInputElement>, "onChange"> {
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
}

export function Switch({ children, disabled, onChange, ...props }: Props) {
  return (
    <label className={cssNames(styles.Switch, { [styles.disabled]: disabled })} data-testid="switch">
      {children}
      <input type="checkbox" role="switch" disabled={disabled} onChange={(event) => onChange?.(props.checked, event)} {...props}/>
    </label>
  );
}
