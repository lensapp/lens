/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./hotbar-menu.scss";

import React, { HTMLAttributes, ReactNode, useState } from "react";

import { cssNames } from "../../utils";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  index: number;
  innerRef?: React.Ref<HTMLDivElement>;
}

export function HotbarCell({ innerRef, children, className, ...rest }: Props) {
  const [animating, setAnimating] = useState(false);
  const onAnimationEnd = () => { setAnimating(false); };
  const onClick = () => {
    setAnimating(!className.includes("isDraggingOver"));
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
