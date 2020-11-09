import "./line-progress.scss";
import React from "react";
import { cssNames } from "../../utils";
import { TooltipDecoratorProps, withTooltip } from "../tooltip";

export interface LineProgressProps extends React.HTMLProps<any>, TooltipDecoratorProps {
  value: number;
  min?: number;
  max?: number;
  className?: any;
  precise?: number;
}

@withTooltip
export class LineProgress extends React.PureComponent<LineProgressProps> {
  static defaultProps: LineProgressProps = {
    value: 0,
    min: 0,
    max: 100,
    precise: 2,
  };

  render() {
    const { className, min, max, value, precise, children, ...props } = this.props;
    let valuePercents = Math.min(100, value / (max - min) * 100);
    const valuePercentsRounded = +valuePercents.toFixed(precise)
    if (valuePercentsRounded) {
      valuePercents = valuePercentsRounded;
    }
    return (
      <div className={cssNames("LineProgress", className)} {...props}>
        <div className="line" style={{ width: valuePercents + "%" }}></div>
        {children}
      </div>
    );
  }
}
