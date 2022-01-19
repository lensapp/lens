/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
