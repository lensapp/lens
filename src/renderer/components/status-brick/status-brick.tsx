import "./status-brick.scss";

import React from "react";
import { cssNames } from "../../utils";
import { TooltipDecoratorProps, withTooltip } from "../tooltip";

export interface StatusBrickProps extends React.HTMLAttributes<any>, TooltipDecoratorProps {
}

@withTooltip
export class StatusBrick extends React.Component<StatusBrickProps> {
  render() {
    const { className, ...elemProps } = this.props
    return (
      <div
        className={cssNames("StatusBrick", className)}
        {...elemProps}
      />
    )
  }
}