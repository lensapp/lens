import "./badge.scss";

import React from "react";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { cssNames } from "../../utils/cssNames";
import { TooltipDecoratorProps, withTooltip } from "../tooltip";
import { autobind } from "../../utils";

export interface BadgeProps extends React.HTMLAttributes<any>, TooltipDecoratorProps {
  small?: boolean;
  label?: React.ReactNode;
  isExpanded?: boolean; // always force state to this value
}

const badgeMeta = observable({
  hasTextSelected: false,
});

// Common handler for all Badge instances
document.addEventListener("selectionchange", () => {
  badgeMeta.hasTextSelected = window.getSelection().toString().trim().length > 0;
});

@withTooltip
@observer
export class Badge extends React.Component<BadgeProps> {
  @observable.ref elem: HTMLElement;
  @observable isExpanded = false;

  @computed get isExpandable() {
    return this.elem?.clientWidth < this.elem?.scrollWidth;
  }

  @autobind()
  onMouseUp(evt: React.MouseEvent) {
    if (!this.isExpandable || badgeMeta.hasTextSelected) return; // no action required
    this.isExpanded = !this.isExpanded;
  }

  @autobind()
  bindRef(elem: HTMLElement) {
    this.elem = elem;
  }

  render() {
    const { className, label, small, children, isExpanded, ...elemProps } = this.props;
    const classNames = cssNames("Badge", className, {
      small,
      interactive: this.isExpandable,
      isExpanded: isExpanded ?? this.isExpanded,
    });
    return (
      <div {...elemProps} className={classNames} onMouseUp={this.onMouseUp} ref={this.bindRef}>
        {label}
        {children}
      </div>
    );
  }
}
