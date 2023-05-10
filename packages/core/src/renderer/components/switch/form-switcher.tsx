/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { StrictReactNode } from "@k8slens/utilities";
import React from "react";

interface FormControlLabelProps {
  control: React.ReactElement<any, any>;
  label: StrictReactNode;
}

/**
 * @deprecated Use <Switch/> instead from "../switch.tsx".
 */
export function FormSwitch(props: FormControlLabelProps & { children?: StrictReactNode }) {
  const ClonedElement = React.cloneElement(props.control, {
    children: <span>{props.label}</span>,
  });

  return ClonedElement;
}
