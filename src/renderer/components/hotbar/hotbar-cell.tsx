/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./hotbar-menu.scss";

import type { HTMLAttributes, ReactNode } from "react";
import React, { useState } from "react";

import { cssNames } from "../../utils";

export interface HotbarCellProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  index: number;
  innerRef?: React.Ref<HTMLDivElement>;
}

export function HotbarCell({ innerRef, children, className, ...rest }: HotbarCellProps) {
  const [animating, setAnimating] = useState(false);
  const onAnimationEnd = () => { setAnimating(false); };
  const onClick = () => {
    setAnimating(!className?.includes("isDraggingOver"));
  };

  return (
    <div
      className={cssNames("HotbarCell", { animating }, className)}
      onAnimationEnd={onAnimationEnd}
      onClick={onClick}
      ref={innerRef}
      {...rest}
    >
      {children}
    </div>
  );
}
