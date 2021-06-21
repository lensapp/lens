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

import "./entity-icon.scss";

import React, { DOMAttributes } from "react";
import { cssNames, IClassName } from "../../utils";
import { Avatar } from "../avatar/avatar";
import { Icon } from "../icon";

export interface EntityIconProps extends DOMAttributes<HTMLElement> {
  title: string;
  size?: number;
  source: string;
  src?: string;
  material?: string;
  background?: string;
  active?: boolean;
  className?: IClassName;
  hoverWidth?: string;
}

export function EntityIcon({ active, size = 40, hoverWidth = "3px", material, className, ...props }: EntityIconProps) {
  return (
    <Avatar
      width={size}
      height={size}
      colorHash={`${props.title}-${props.source}`}
      className={cssNames("EntityIcon", className, active ? "active" : "default")}
      style={{
        "--hover-width": hoverWidth,
      } as React.CSSProperties}
      {...props}
    >
      {material && <Icon className="materialIcon" material={material} />}
    </Avatar>
  );
}
