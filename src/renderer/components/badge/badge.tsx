import "./badge.scss"

import React from "react";
import { cssNames } from "../../utils/cssNames";
import { TooltipDecoratorProps, withTooltip } from "../tooltip";
import { observer } from "mobx-react";
import { autobind } from "../../utils";
import { observable } from "mobx";
import { Icon } from "../icon";

export interface BadgeProps extends React.HTMLAttributes<any>, TooltipDecoratorProps {
  small?: boolean;
  label?: React.ReactNode;
}

@withTooltip
@observer
export class Badge extends React.Component<BadgeProps> {
  private elem: HTMLElement;

  @observable isExpanded = false
  @observable canBeExpanded = false

  componentDidMount() {
    this.canBeExpanded = this.elem.offsetWidth < this.elem.scrollWidth
  }

  @autobind()
  onClick() {
    if (this.canBeExpanded) {
      this.isExpanded = !this.isExpanded
    }
  }

  renderExpansionIcon() {
    if (!this.canBeExpanded) {
      return null
    }

    if (this.isExpanded) {
      return <Icon className="expansionIcon" size={20} material="close_fullscreen" onClick={this.onClick} />
    }

    return <Icon className="expansionIcon" size={20} material="open_in_full" onClick={this.onClick} />
  }

  render() {
    const { className, label, small, children, ...elemProps } = this.props;
    const classNames = cssNames("Badge", className, { small, expanded: this.isExpanded })

    return (
      <div className={classNames} {...elemProps}>
        {this.renderExpansionIcon()}
        <div className="children" ref={ref => (this.elem = ref)}>
          {label}
          {children}
        </div>
      </div>
    )
  }
}
