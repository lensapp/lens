import './tooltip.scss'

import React from "react"
import { observer } from "mobx-react";
import { autobind, cssNames, IClassName } from "../../utils";
import { observable } from "mobx";

export type TooltipPosition = "top" | "left" | "right" | "bottom";

export interface TooltipProps {
  targetId: string; // "id" of target html-element to bind
  visible?: boolean;
  offset?: number; // px
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

  componentDidMount() {
    this.targetElem.addEventListener("mouseenter", this.onEnterTarget)
    this.targetElem.addEventListener("mouseleave", this.onLeaveTarget)
  }

  componentWillUnmount() {
    this.targetElem.removeEventListener("mouseenter", this.onEnterTarget)
    this.targetElem.removeEventListener("mouseleave", this.onLeaveTarget)
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

    let allPositions: TooltipPosition[] = ["right", "bottom", "top", "left"];
    if (allPositions.includes(position)) {
      allPositions = [
        position, // put first as priority side for positioning
        ...allPositions.filter(pos => pos !== position),
      ];
    }

    // reset position first and get all possible client-rect area for tooltip element
    this.setPosition({ left: 0, top: 0 });

    const selfBounds = elem.getBoundingClientRect();
    const targetBounds = targetElem.getBoundingClientRect();
    const { innerWidth: viewportWidth, innerHeight: viewportHeight } = window;

    // find proper position
    this.activePosition = null;
    for (const pos of allPositions) {
      const { left, top, right, bottom } = this.getPosition(pos, selfBounds, targetBounds)
      const fitsToWindow = left >= 0 && top >= 0 && right <= viewportWidth && bottom <= viewportHeight;
      if (fitsToWindow) {
        this.activePosition = pos;
        this.setPosition({ top, left });
        break;
      }
    }
    if (!this.activePosition) {
      const { left, top } = this.getPosition(allPositions[0], selfBounds, targetBounds)
      this.activePosition = allPositions[0];
      this.setPosition({ left, top });
    }
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
      left,
      top,
      right: left + selfBounds.width,
      bottom: top + selfBounds.height,
    };
  }

  @autobind()
  bindRef(elem: HTMLElement) {
    this.elem = elem;
  }

  render() {
    const { style, formatters, position, children } = this.props;
    const className = cssNames("Tooltip", this.props.className, formatters, this.activePosition, {
      hidden: !this.isVisible,
      formatter: !!formatters,
    });
    return (
      <div className={className} style={style} ref={this.bindRef}>
        {children}
      </div>
    );
  }
}
