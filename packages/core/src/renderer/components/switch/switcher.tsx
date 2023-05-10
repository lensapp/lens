/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { StrictReactNode } from "@k8slens/utilities";
import React from "react";
import { Switch } from "./switch";

export interface SwitcherProps {
  disabled?: boolean;
  children?: StrictReactNode;
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  name?: string;
}

/**
 * @deprecated Use <Switch/> instead from "../switch.tsx".
 */
export function Switcher({ disabled, checked, onChange, name, children }: SwitcherProps) {
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
}
