/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { FormControlLabelProps } from "@material-ui/core/FormControlLabel";

/**
 * @deprecated Use <Switch/> instead from "../switch.tsx".
 */
export function FormSwitch(props: FormControlLabelProps & { children?: React.ReactNode }) {
  const ClonedElement = React.cloneElement(props.control, {
    children: props.label,
  });

  return ClonedElement;
}
