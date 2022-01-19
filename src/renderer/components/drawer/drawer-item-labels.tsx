/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { DrawerItem, DrawerItemProps } from "./drawer-item";
import { Badge } from "../badge";

export interface DrawerItemLabelsProps extends DrawerItemProps {
  labels: string[];
}

export function DrawerItemLabels(props: DrawerItemLabelsProps) {
  const { labels, ...itemProps } = props;

  if (!labels || !labels.length) {
    return null;
  }

  return (
    <DrawerItem {...itemProps} labelsOnly>
      {labels.map(label => <Badge key={label} label={label} title={label}/>)}
    </DrawerItem>
  );
}
