import React from "react";
import { TooltipDecoratorProps, withTooltip } from "../tooltip";

export interface SpanProps extends React.HTMLAttributes<any>, TooltipDecoratorProps {
  label?: React.ReactNode;
}

@withTooltip
export class Span extends React.Component<SpanProps> {
  render() {
    const { className, label, children, ...elemProps } = this.props;

    return <>
      <span className={className} {...elemProps}>
        {label}
        {children}
      </span>
    </>;
  }
}
