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
import { computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import { cssNames } from "../../utils/cssNames";
import { TooltipDecoratorProps, withTooltip } from "../tooltip";

export interface BadgeProps extends React.HTMLAttributes<any>, TooltipDecoratorProps {
  small?: boolean;
  flat?: boolean;
  label?: React.ReactNode;
  isExpanded?: boolean; // always force state to this value
}

@withTooltip
@observer
export class Badge extends React.Component<BadgeProps> {
  @observable _isExpanded = false;
  @observable hasHighlightedText = false;
  @observable ref = React.createRef<HTMLDivElement>();

  constructor(props: BadgeProps) {
    super(props);
    makeObservable(this);
  }

  componentWillUnmount() {
    document.removeEventListener("selectionchange", this.onSelectionChange);
  }

  @computed get isExpanded() {
    return this.props.isExpanded ?? this._isExpanded;
  }

  @computed get isExpandable() {
    if (!this.ref.current) {
      return false;
    }

    const { flat } = this.props;
    const { scrollWidth, clientWidth, clientHeight, scrollHeight } = this.ref.current;

    return !flat && (clientWidth < scrollWidth || clientHeight < scrollHeight);
  }

  onSelectionChange = () => {
    this.hasHighlightedText ||= document.getSelection().toString().length > 0;
  };

  onMouseDown = () => {
    this.onSelectionChange(); // initial "event" fire on mouse down (for clearing old selections)
    document.addEventListener("selectionchange", this.onSelectionChange);
  };

  onMouseUp = () => {
    document.removeEventListener("selectionchange", this.onSelectionChange);

    if (!this.hasHighlightedText) {
      this._isExpanded = !this._isExpanded;
    }

    this.hasHighlightedText = false;
  };

  render() {
    const { isExpandable, isExpanded } = this;
    const { className, label, small, flat, children, isExpanded: _, ...elemProps } = this.props;
    const clickable = Boolean(this.props.onClick);
    const classNames = cssNames("Badge", className, {
      small,
      flat,
      isExpandable,
      isExpanded,
      clickable,
    });

    return (
      <div {...elemProps} className={classNames} onMouseUp={this.onMouseUp} onMouseDown={this.onMouseDown} ref={this.ref}>
        {label}
        {children}
      </div>
    );
  }
}
