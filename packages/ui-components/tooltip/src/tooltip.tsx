/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./tooltip.scss";

import React from "react";
import { createPortal } from "react-dom";
import { observer } from "mobx-react";
import type { IClassName, StrictReactNode } from "@k8slens/utilities";
import { cssNames } from "@k8slens/utilities";
import { observable, makeObservable, action, runInAction } from "mobx";
import autoBindReact from "auto-bind/react";
import { computeNextPosition } from "./helpers";

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
  children?: StrictReactNode;
  "data-testid"?: string;
}

export interface TooltipContentFormatters {
  narrow?: boolean; // max-width
  warning?: boolean; // color
  small?: boolean; // font-size
  nowrap?: boolean; // white-space
  tableView?: boolean;
}

const defaultProps = {
  usePortal: true,
  offset: 10,
};

@observer
class DefaultedTooltip extends React.Component<TooltipProps & typeof defaultProps> {
  static defaultProps = defaultProps as object;

  @observable.ref elem: HTMLDivElement | null = null;

  @observable activePosition?: TooltipPosition;

  @observable isVisible = false;

  @observable isContentVisible = false; // animation manager

  constructor(props: TooltipProps & typeof defaultProps) {
    super(props);
    makeObservable(this);
    autoBindReact(this);
  }

  get targetElem(): HTMLElement | null {
    return document.getElementById(this.props.targetId);
  }

  get hoverTarget(): HTMLElement | null {
    if (this.props.tooltipOnParentHover) {
      return this.targetElem?.parentElement ?? null;
    }

    return this.targetElem;
  }

  componentDidMount() {
    this.hoverTarget?.addEventListener("mouseenter", this.onEnterTarget);
    this.hoverTarget?.addEventListener("mouseleave", this.onLeaveTarget);
    this.refreshPosition();
  }

  componentDidUpdate() {
    this.refreshPosition();
  }

  componentWillUnmount() {
    this.hoverTarget?.removeEventListener("mouseenter", this.onEnterTarget);
    this.hoverTarget?.removeEventListener("mouseleave", this.onLeaveTarget);
  }

  @action
  protected onEnterTarget() {
    this.isVisible = true;
    requestAnimationFrame(action(() => (this.isContentVisible = true)));
  }

  @action
  protected onLeaveTarget() {
    this.isVisible = false;
    this.isContentVisible = false;
  }

  refreshPosition() {
    const { preferredPositions, offset } = this.props;
    const { elem, targetElem } = this;

    if (!elem || !targetElem) {
      return;
    }

    this.setPosition(elem, { left: 0, top: 0 });

    const { position, ...location } = computeNextPosition({
      offset,
      preferredPositions,
      target: targetElem,
      tooltip: elem,
    });

    runInAction(() => {
      this.activePosition = position;
      this.setPosition(elem, location);
    });
  }

  protected setPosition(elem: HTMLDivElement, pos: { left: number; top: number }) {
    elem.style.left = `${pos.left}px`;
    elem.style.top = `${pos.top}px`;
  }

  render() {
    const { style, formatters, usePortal, children, visible = this.isVisible } = this.props;

    if (!visible) {
      return null;
    }

    const className = cssNames("Tooltip", this.props.className, formatters, this.activePosition, {
      visible: this.isContentVisible || this.props.visible,
      formatter: !!formatters,
    });
    const tooltip = (
      <div
        className={className}
        style={style}
        ref={(elem) => (this.elem = elem)}
        role="tooltip"
        data-testid={this.props["data-testid"]}
      >
        {children}
      </div>
    );

    if (usePortal) {
      return createPortal(tooltip, document.body);
    }

    return tooltip;
  }
}

export const Tooltip = DefaultedTooltip as React.ComponentClass<TooltipProps>;
