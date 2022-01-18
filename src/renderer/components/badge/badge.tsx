/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./badge.module.scss";

import React from "react";
import { computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import { cssNames } from "../../utils/cssNames";
import { TooltipDecoratorProps, withTooltip } from "../tooltip";
import { boundMethod } from "../../utils";

export interface BadgeProps extends React.HTMLAttributes<any>, TooltipDecoratorProps {
  small?: boolean;
  flat?: boolean;
  label?: React.ReactNode;
  expandable?: boolean;
  disabled?: boolean;
  scrollable?: boolean;
}

// Common handler for all Badge instances
document.addEventListener("selectionchange", () => {
  Badge.badgeMeta.hasTextSelected ||= window.getSelection().toString().trim().length > 0;
});

@withTooltip
@observer
export class Badge extends React.Component<BadgeProps> {
  static defaultProps: Partial<BadgeProps> = {
    expandable: true,
  };

  static badgeMeta = observable({
    hasTextSelected: false,
  });

  @observable.ref elem: HTMLElement;
  @observable isExpanded = false;

  constructor(props: BadgeProps) {
    super(props);
    makeObservable(this);
  }

  @computed get isExpandable() {
    if (!this.props.expandable) return false;

    return this.elem?.clientWidth < this.elem?.scrollWidth;
  }

  @boundMethod
  onMouseUp() {
    if (!this.isExpandable || Badge.badgeMeta.hasTextSelected) {
      Badge.badgeMeta.hasTextSelected = false;
    } else {
      this.isExpanded = !this.isExpanded;
    }
  }

  @boundMethod
  bindRef(elem: HTMLElement) {
    this.elem = elem;
  }

  render() {
    const { className, label, disabled, scrollable, small, children, flat, expandable, ...elemProps } = this.props;
    const clickable = Boolean(this.props.onClick) || this.isExpandable;
    const classNames = cssNames(styles.badge, className, {
      [styles.small]: small,
      [styles.flat]: flat,
      [styles.clickable]: clickable,
      [styles.interactive]: this.isExpandable,
      [styles.isExpanded]: this.isExpanded,
      [styles.disabled]: disabled,
      [styles.scrollable]: scrollable,
    });

    return (
      <div {...elemProps} className={classNames} onMouseUp={this.onMouseUp} ref={this.bindRef}>
        {label}
        {children}
      </div>
    );
  }
}
