import "./badge.scss"

import React from "react";
import { cssNames } from "../../utils/cssNames";
import { TooltipDecoratorProps, withTooltip } from "../tooltip";

interface Props extends React.HTMLAttributes<any>, TooltipDecoratorProps {
  small?: boolean;
  label?: React.ReactNode;
}

@withTooltip
export class Badge extends React.Component<Props> {
  render() {
    const { className, label, small, children, ...elemProps } = this.props;
    return <>
      <span className={cssNames("Badge", { small }, className)} {...elemProps}>
        {label}
        {children}
      </span>
    </>
  }
}
