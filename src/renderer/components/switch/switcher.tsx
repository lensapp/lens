/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { SwitchClassKey, SwitchProps } from "@material-ui/core/Switch";
import { Switch } from "./switch";

interface Styles extends Partial<Record<SwitchClassKey, string>> {
  focusVisible?: string;
}

export interface SwitcherProps extends SwitchProps {
  classes: Styles;
  children?: React.ReactNode;
}

/**
 * @deprecated Use <Switch/> instead from "../switch.tsx".
 */
export const Switcher = () => (({  disabled, checked, onChange, name, children }: SwitcherProps) => {
  return (
    <Switch
      disabled={disabled}
      checked={checked}
      name={name}
      onChange={(checked, event) => onChange?.(event, checked)}
    >
      {children}
    </Switch>
  );
});
