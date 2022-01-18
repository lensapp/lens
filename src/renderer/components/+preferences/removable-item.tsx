/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "./removable-item.module.scss";

import React, { DOMAttributes } from "react";

import { cssNames } from "../../utils";
import { Icon } from "../icon";

interface Props extends DOMAttributes<any>{
  icon?: string;
  onRemove: () => void;
  className?: string;
}

export function RemovableItem({ icon, onRemove, children, className, ...rest }: Props) {
  return (
    <div className={cssNames(styles.item, "flex gaps align-center justify-space-between", className)} {...rest}>
      {icon && (
        <Icon material={icon}/>
      )}
      {children}
      <Icon
        material="delete"
        onClick={onRemove}
        tooltip="Remove"
      />
    </div>
  );
}
