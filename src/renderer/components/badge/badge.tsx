import "./badge.scss";

import React from "react";
import { cssNames } from "../../utils/cssNames";
import { TooltipDecoratorProps, withTooltip } from "../tooltip";

export interface BadgeProps extends React.HTMLAttributes<any>, TooltipDecoratorProps {
  small?: boolean;
  flat?: boolean;
  label?: React.ReactNode;
}

@withTooltip
export class Badge extends React.Component<BadgeProps> {
  render() {
    const { className, label, small, flat, children, ...elemProps } = this.props;

    return <>
      <span className={cssNames("Badge", { small, flat }, className)} {...elemProps}>
        {label}
        {children}
      </span>
    </>;
  }
}
