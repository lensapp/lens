import "./status-brick.scss";

import * as React from "react";
import { cssNames } from "../../utils";
import { TooltipDecoratorProps, withTooltip } from "../tooltip";

interface Props extends React.HTMLAttributes<any>, TooltipDecoratorProps {
}

@withTooltip
export class StatusBrick extends React.Component<Props> {
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