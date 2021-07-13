/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./badge.scss";

import React from "react";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { cssNames } from "../../utils/cssNames";
import { TooltipDecoratorProps, withTooltip } from "../tooltip";
import { boundMethod } from "../../utils";

export interface BadgeProps extends React.HTMLAttributes<any>, TooltipDecoratorProps {
  small?: boolean;
  flat?: boolean;
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

  @boundMethod
  onMouseUp() {
    if (!this.isExpandable || badgeMeta.hasTextSelected) return; // no action required
    this.isExpanded = !this.isExpanded;
  }

  @boundMethod
  bindRef(elem: HTMLElement) {
    this.elem = elem;
  }

  render() {
    const { className, label, small, children, isExpanded, flat, ...elemProps } = this.props;
    const clickable = Boolean(this.props.onClick);
    const classNames = cssNames("Badge", className, {
      small,
      flat,
      clickable,
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
