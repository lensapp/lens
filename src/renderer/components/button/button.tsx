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

import "./button.scss";
import React, { ButtonHTMLAttributes } from "react";
import { cssNames } from "../../utils";
import { TooltipDecoratorProps, withTooltip } from "../tooltip";

export interface ButtonProps extends ButtonHTMLAttributes<any>, TooltipDecoratorProps {
  label?: React.ReactNode;
  waiting?: boolean;
  primary?: boolean;
  accent?: boolean;
  light?: boolean;
  plain?: boolean;
  outlined?: boolean;
  hidden?: boolean;
  active?: boolean;
  big?: boolean;
  round?: boolean;
  href?: string; // render as hyperlink
  target?: "_blank"; // in case of using @href
}

@withTooltip
export class Button extends React.PureComponent<ButtonProps, {}> {
  render() {
    const {
      waiting, label, primary, accent, plain, hidden, active, big,
      round, outlined, tooltip, light, children, ...btnProps
    } = this.props;

    if (hidden) return null;

    btnProps.className = cssNames("Button", btnProps.className, {
      waiting, primary, accent, plain, active, big, round, outlined, light,
    });

    // render as link
    if (this.props.href) {
      return (
        <a {...btnProps}>
          {label}
          {children}
        </a>
      );
    }

    // render as button
    return (
      <button type="button" {...btnProps}>
        {label}
        {children}
      </button>
    );
  }
}
