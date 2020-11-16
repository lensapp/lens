import "./badge.scss"

import React from "react";
import { cssNames } from "../../utils/cssNames";
import { TooltipDecoratorProps, withTooltip } from "../tooltip";
import { observer } from "mobx-react";
import { autobind } from "../../utils";
import { observable } from "mobx";

export interface BadgeProps extends React.HTMLAttributes<any>, TooltipDecoratorProps {
  small?: boolean;
  label?: React.ReactNode;
  isExpanded?: boolean; // by default: false (minimized)
}

@withTooltip
@observer
export class Badge extends React.Component<BadgeProps> {
  @observable isExpanded = false;

  @autobind()
  onMouseRelease() {
    const textSelected = document.getSelection().toString().trim() !== "";
    if (textSelected) return;
    this.isExpanded = this.props.isExpanded /*force to use state from outside*/ ?? !this.isExpanded /*toggle*/;
  }

  render() {
    const { className, label, small, children, isExpanded, ...elemProps } = this.props;
    const classNames = cssNames("Badge", className, {
      small: small,
    })
    const labelClass = cssNames("label-content", {
      isExpanded: this.isExpanded,
    })
    return (
      <div {...elemProps} className={classNames}>
        <div className={labelClass} onMouseUp={this.onMouseRelease}>
          {label}
          {children}
        </div>
      </div>
    )
  }
}
