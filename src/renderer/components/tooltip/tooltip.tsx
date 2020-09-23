import './tooltip.scss'

import React from "react"
import { createPortal } from "react-dom"
import { observer } from "mobx-react";
import { autobind, cssNames, IClassName } from "../../utils";
import { observable } from "mobx";

export enum TooltipPosition {
  TOP = "top",
  BOTTOM = "bottom",
  LEFT = "left",
  RIGHT = "right",
}

export interface TooltipProps {
  targetId: string; // html-id of target element to bind for
  tooltipOnParentHover?: boolean; // detect hover on parent of target
  visible?: boolean; // initial visibility
  offset?: number; // offset from target element in pixels (all sides)
  usePortal?: boolean; // renders element outside of parent (in body), disable for "easy-styling", default: true
  position?: TooltipPosition;
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
}

@observer
export class Tooltip extends React.Component<TooltipProps> {
  static defaultProps = defaultProps as object;

  @observable.ref elem: HTMLElement;
  @observable activePosition: TooltipPosition;
  @observable isVisible = !!this.props.visible;

  get targetElem(): HTMLElement {
    return document.getElementById(this.props.targetId)
  }

  get hoverTarget(): HTMLElement {
    if (this.props.tooltipOnParentHover) {
      return this.targetElem.parentElement
    }

    return this.targetElem
  }

  componentDidMount() {
    this.hoverTarget.addEventListener("mouseenter", this.onEnterTarget)
    this.hoverTarget.addEventListener("mouseleave", this.onLeaveTarget)
  }

  componentWillUnmount() {
    this.hoverTarget.removeEventListener("mouseenter", this.onEnterTarget)
    this.hoverTarget.removeEventListener("mouseleave", this.onLeaveTarget)
  }

  @autobind()
  protected onEnterTarget(evt: MouseEvent) {
    this.isVisible = true;
    this.refreshPosition();
  }

  @autobind()
  protected onLeaveTarget(evt: MouseEvent) {
    this.isVisible = false;
  }

  @autobind()
  refreshPosition() {
    const { position } = this.props;
    const { elem, targetElem } = this;

    const positionPreference = new Set<TooltipPosition>();
    if (typeof position !== "undefined") {
      positionPreference.add(position);
    }
    positionPreference.add(TooltipPosition.RIGHT)
      .add(TooltipPosition.BOTTOM)
      .add(TooltipPosition.TOP)
      .add(TooltipPosition.LEFT)

    // reset position first and get all possible client-rect area for tooltip element
    this.setPosition({ left: 0, top: 0 });

    const selfBounds = elem.getBoundingClientRect();
    const targetBounds = targetElem.getBoundingClientRect();
    const { innerWidth: viewportWidth, innerHeight: viewportHeight } = window;

    // find proper position
    for (const pos of positionPreference) {
      const { left, top, right, bottom } = this.getPosition(pos, selfBounds, targetBounds)
      const fitsToWindow = left >= 0 && top >= 0 && right <= viewportWidth && bottom <= viewportHeight;
      if (fitsToWindow) {
        this.activePosition = pos;
        this.setPosition({ top, left });
        
        return;
      }
    }

    const preferedPosition = Array.from(positionPreference)[0];
    const { left, top } = this.getPosition(preferedPosition, selfBounds, targetBounds)
    this.activePosition = preferedPosition;
    this.setPosition({ left, top });
  }

  protected setPosition(pos: { left: number, top: number }) {
    const elemStyle = this.elem.style;
    elemStyle.left = pos.left + "px"
    elemStyle.top = pos.top + "px"
  }

  protected getPosition(position: TooltipPosition, selfBounds: DOMRect, targetBounds: DOMRect) {
    let left: number
    let top: number
    const offset = this.props.offset;
    const horizontalCenter = targetBounds.left + (targetBounds.width - selfBounds.width) / 2;
    const verticalCenter = targetBounds.top + (targetBounds.height - selfBounds.height) / 2;
    switch (position) {
    case "top":
      left = horizontalCenter;
      top = targetBounds.top - selfBounds.height - offset;
      break;
    case "bottom":
      left = horizontalCenter;
      top = targetBounds.bottom + offset;
      break;
    case "left":
      top = verticalCenter;
      left = targetBounds.left - selfBounds.width - offset;
      break;
    case "right":
      top = verticalCenter;
      left = targetBounds.right + offset;
      break;
    }
    return {
      left: left,
      top: top,
      right: left + selfBounds.width,
      bottom: top + selfBounds.height,
    };
  }

  @autobind()
  bindRef(elem: HTMLElement) {
    this.elem = elem;
  }

  render() {
    const { style, formatters, usePortal, children } = this.props;
    const className = cssNames("Tooltip", this.props.className, formatters, this.activePosition, {
      hidden: !this.isVisible,
      formatter: !!formatters,
    });
    const tooltip = (
      <div className={className} style={style} ref={this.bindRef}>
        {children}
      </div>
    )
    if (usePortal) {
      return createPortal(tooltip, document.body,);
    }
    return tooltip;
  }
}
