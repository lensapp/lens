/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import "./hotbar-menu.scss";

import React, { HTMLAttributes, ReactNode, useState } from "react";

import { cssNames } from "../../utils";
import { Icon } from "../icon";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  index: number;
  innerRef?: React.Ref<HTMLDivElement>;

  /**
   * If present then on :hover an X will be displayed which will call this
   * function when clicked
   */
  remove?: () => void;
}

export function HotbarCell({ innerRef, children, className, remove, ...rest }: Props) {
  const [animating, setAnimating] = useState(false);
  const onAnimationEnd = () => { setAnimating(false); };
  const onClick = () => {
    setAnimating(!className.includes("isDraggingOver"));
  };
  const removeIcon = remove && (
    <Icon className="remove" material="close" onClick={remove}/>
  );

  return (
    <div
      className={cssNames("HotbarCell", { animating }, className)}
      onAnimationEnd={onAnimationEnd}
      onClick={onClick}
      ref={innerRef}
      {...rest}
    >
      {removeIcon}
      {children}
    </div>
  );
}
