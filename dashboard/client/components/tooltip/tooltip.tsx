import './tooltip.scss'

import React from "react"
import { observer } from "mobx-react";
import { observable } from "mobx";
import { createPortal } from "react-dom"
import { autobind, cssNames } from "../../utils";
import { Animate } from "../animate";

export interface TooltipProps {
  htmlFor: string;
  className?: string;
  position?: Position;
  useAnimation?: boolean;
  following?: boolean; // tooltip is following mouse position
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

interface Position {
  left?: boolean;
  right?: boolean;
  top?: boolean;
  bottom?: boolean;
  center?: boolean;
}

const defaultProps: Partial<TooltipProps> = {
  useAnimation: true,
  position: {
    center: true,
    bottom: true,
  }
};

@observer
export class Tooltip extends React.Component<TooltipProps> {
  static defaultProps = defaultProps as object;

  public anchor: HTMLElement;
  public elem: HTMLElement;

  @observable isVisible = false;

  componentDidMount() {
    const { htmlFor } = this.props;
    this.anchor = htmlFor ? document.getElementById(htmlFor) : this.elem.parentElement;
    if (this.anchor) {
      if (window.getComputedStyle(this.anchor).position === "static") {
        this.anchor.style.position = "relative"
      }
      this.anchor.addEventListener("mouseenter", this.onMouseEnter);
      this.anchor.addEventListener("mouseleave", this.onMouseLeave);
      this.anchor.addEventListener("mousemove", this.onMouseMove);
    }
  }

  componentWillUnmount() {
    if (this.anchor) {
      this.anchor.removeEventListener("mouseenter", this.onMouseEnter);
      this.anchor.removeEventListener("mouseleave", this.onMouseLeave);
      this.anchor.removeEventListener("mousemove", this.onMouseMove);
    }
  }

  @autobind()
  onMouseEnter(evt: MouseEvent) {
    this.isVisible = true;
    this.onMouseMove(evt);
  }

  @autobind()
  onMouseLeave(evt: MouseEvent) {
    this.isVisible = false;
  }

  @autobind()
  onMouseMove(evt: MouseEvent) {
    if (!this.props.following) {
      return;
    }

    const offsetX = -10;
    const offsetY = 10;
    const { clientX, clientY } = evt;
    const { innerWidth, innerHeight } = window;

    const initialPos: Partial<CSSStyleDeclaration> = {
      top: "auto",
      left: "auto",
      right: (innerWidth - clientX + offsetX) + "px",
      bottom: (innerHeight - clientY + offsetY) + "px",
    }

    Object.assign(this.elem.style, initialPos);

    // correct position if not fits to viewport
    const { left, top } = this.elem.getBoundingClientRect();
    if (left < 0) {
      this.elem.style.left = clientX + offsetX + "px";
      this.elem.style.right = "auto"
    }
    if (top < 0) {
      this.elem.style.top = clientY + offsetY + "px";
      this.elem.style.bottom = "auto"
    }
  }

  @autobind()
  bindRef(elem: HTMLElement) {
    this.elem = elem;
  }

  render() {
    const { isVisible } = this;
    const { useAnimation, position, following, style, children } = this.props;
    let { className } = this.props;
    className = cssNames('Tooltip', position, { following }, className);
    const tooltip = (
      <Animate enter={isVisible} enabled={useAnimation}>
        <div className={className} ref={this.bindRef} style={style}>
          {children}
        </div>
      </Animate>
    );
    if (following) {
      return createPortal(tooltip, document.body);
    }
    return tooltip;
  }
}

interface TooltipContentProps {
  className?: string;
  narrow?: boolean; // max-width
  warning?: boolean; // color
  small?: boolean; // font-size
  nowrap?: boolean; // white-space
  tableView?: boolean;
}

export class TooltipContent extends React.Component<TooltipContentProps> {
  render() {
    const { className, children, ...modifiers } = this.props;
    return (
      <div className={cssNames("TooltipContent", className, modifiers)}>
        {children}
      </div>
    )
  }
}
