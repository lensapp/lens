import "./hotbar-menu.scss";
import "./hotbar.commands";

import React, { HTMLAttributes, ReactNode, useState } from "react";

import { cssNames } from "../../utils";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  index: number;
  innerRef?: React.LegacyRef<HTMLDivElement>;
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
