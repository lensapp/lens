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

import "./tooltip.scss";

import React from "react";
import { createPortal } from "react-dom";
import { observer } from "mobx-react";
import { boundMethod, cssNames, IClassName } from "../../utils";
import { observable, makeObservable } from "mobx";

export enum TooltipPosition {
  TOP = "top",
  BOTTOM = "bottom",
  LEFT = "left",
  RIGHT = "right",
  TOP_LEFT = "top_left",
  TOP_RIGHT = "top_right",
  BOTTOM_LEFT = "bottom_left",
  BOTTOM_RIGHT = "bottom_right",
}

export interface TooltipProps {
  targetId: string; // html-id of target element to bind for
  tooltipOnParentHover?: boolean; // detect hover on parent of target
  visible?: boolean; // initial visibility
  offset?: number; // offset from target element in pixels (all sides)
  usePortal?: boolean; // renders element outside of parent (in body), disable for "easy-styling", default: true
  preferredPositions?: TooltipPosition | TooltipPosition[];
  className?: IClassName;
  formatters?: TooltipContentFormatters;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface TooltipContentFormatters {
  narrow?: boolean; // max-width
  warning?: boolean; // color
  small?: boolean; // font-size
  nowrap?: boolean; // white-space
  tableView?: boolean;
}

const defaultProps: Partial<TooltipProps> = {
  usePortal: true,
  offset: 10,
};

@observer
export class Tooltip extends React.Component<TooltipProps> {
  static defaultProps = defaultProps as object;

  @observable.ref elem: HTMLElement;
  @observable activePosition: TooltipPosition;
  @observable isVisible = !!this.props.visible;

  constructor(props: TooltipProps) {
    super(props);
    makeObservable(this);
  }

  get targetElem(): HTMLElement {
    return document.getElementById(this.props.targetId);
  }

  get hoverTarget(): HTMLElement {
    if (this.props.tooltipOnParentHover) {
      return this.targetElem.parentElement;
    }

    return this.targetElem;
  }

  componentDidMount() {
    this.hoverTarget.addEventListener("mouseenter", this.onEnterTarget);
    this.hoverTarget.addEventListener("mouseleave", this.onLeaveTarget);
  }

  componentWillUnmount() {
    this.hoverTarget.removeEventListener("mouseenter", this.onEnterTarget);
    this.hoverTarget.removeEventListener("mouseleave", this.onLeaveTarget);
  }

  @boundMethod
  protected onEnterTarget() {
    this.isVisible = true;
    this.refreshPosition();
  }

  @boundMethod
  protected onLeaveTarget() {
    this.isVisible = false;
  }

  @boundMethod
  refreshPosition() {
    const { preferredPositions } = this.props;
    const { elem, targetElem } = this;

    let positions = new Set<TooltipPosition>([
      TooltipPosition.RIGHT,
      TooltipPosition.BOTTOM,
      TooltipPosition.TOP,
      TooltipPosition.LEFT,
      TooltipPosition.TOP_RIGHT,
      TooltipPosition.TOP_LEFT,
      TooltipPosition.BOTTOM_RIGHT,
      TooltipPosition.BOTTOM_LEFT,
    ]);

    if (preferredPositions) {
      positions = new Set([
        ...[preferredPositions].flat(),
        ...positions,
      ]);
    }

    // reset position first and get all possible client-rect area for tooltip element
    this.setPosition({ left: 0, top: 0 });

    const selfBounds = elem.getBoundingClientRect();
    const targetBounds = targetElem.getBoundingClientRect();
    const { innerWidth: viewportWidth, innerHeight: viewportHeight } = window;

    // find proper position
    for (const pos of positions) {
      const { left, top, right, bottom } = this.getPosition(pos, selfBounds, targetBounds);
      const fitsToWindow = left >= 0 && top >= 0 && right <= viewportWidth && bottom <= viewportHeight;

      if (fitsToWindow) {
        this.activePosition = pos;
        this.setPosition({ top, left });

        return;
      }
    }

    // apply fallback position if nothing helped from above
    const fallbackPosition = Array.from(positions)[0];
    const { left, top } = this.getPosition(fallbackPosition, selfBounds, targetBounds);

    this.activePosition = fallbackPosition;
    this.setPosition({ left, top });
  }

  protected setPosition(pos: { left: number, top: number }) {
    const elemStyle = this.elem.style;

    elemStyle.left = `${pos.left}px`;
    elemStyle.top = `${pos.top}px`;
  }

  protected getPosition(position: TooltipPosition, tooltipBounds: DOMRect, targetBounds: DOMRect) {
    let left: number;
    let top: number;
    const offset = this.props.offset;
    const horizontalCenter = targetBounds.left + (targetBounds.width - tooltipBounds.width) / 2;
    const verticalCenter = targetBounds.top + (targetBounds.height - tooltipBounds.height) / 2;
    const topCenter = targetBounds.top - tooltipBounds.height - offset;
    const bottomCenter = targetBounds.bottom + offset;

    switch (position) {
      case "top":
        left = horizontalCenter;
        top = topCenter;
        break;
      case "bottom":
        left = horizontalCenter;
        top = bottomCenter;
        break;
      case "left":
        top = verticalCenter;
        left = targetBounds.left - tooltipBounds.width - offset;
        break;
      case "right":
        top = verticalCenter;
        left = targetBounds.right + offset;
        break;
      case "top_left":
        left = targetBounds.left;
        top = topCenter;
        break;
      case "top_right":
        left = targetBounds.right - tooltipBounds.width;
        top = topCenter;
        break;
      case "bottom_left":
        top = bottomCenter;
        left = targetBounds.left;
        break;
      case "bottom_right":
        top = bottomCenter;
        left = targetBounds.right - tooltipBounds.width;
        break;
    }

    return {
      left,
      top,
      right: left + tooltipBounds.width,
      bottom: top + tooltipBounds.height,
    };
  }

  @boundMethod
  bindRef(elem: HTMLElement) {
    this.elem = elem;
  }

  render() {
    const { style, formatters, usePortal, children } = this.props;
    const className = cssNames("Tooltip", this.props.className, formatters, this.activePosition, {
      invisible: !this.isVisible,
      formatter: !!formatters,
    });
    const tooltip = (
      <div className={className} style={style} ref={this.bindRef}>
        {children}
      </div>
    );

    if (usePortal) {
      return createPortal(tooltip, document.body);
    }

    return tooltip;
  }
}
