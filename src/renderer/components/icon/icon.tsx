/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./icon.scss";

import type { ReactNode } from "react";
import React, { createRef } from "react";
import { NavLink } from "react-router-dom";
import type { LocationDescriptor } from "history";
import { autoBind, cssNames } from "../../utils";
import type { TooltipDecoratorProps } from "../tooltip";
import { withTooltip } from "../tooltip";
import isNumber from "lodash/isNumber";
import { decode } from "../../../common/utils/base64";

export interface BaseIconProps {
   /**
   * One of the names from https://material.io/icons/
   */
  material?: string;

  /**
   * Either an SVG data URL or one of the following strings
   */
  svg?: string;

  /**
   * render icon as NavLink from react-router-dom
   */
  link?: LocationDescriptor;

  /**
   * render icon as hyperlink
   */
  href?: string;

  /**
   * The icon size (css units)
   */
  size?: string | number;

  /**
   * A pre-defined icon-size
   */
  small?: boolean;

  /**
   * A pre-defined icon-size
   */
  smallest?: boolean;

  /**
   * A pre-defined icon-size
   */
  big?: boolean;

  /**
   * apply active-state styles
   */
  active?: boolean;

  /**
   * indicates that icon is interactive and highlight it on focus/hover
   */
  interactive?: boolean;

  /**
   * Allow focus to the icon to show `.active` styles. Only applicable if {@link IconProps.interactive} is `true`.
   *
   * @default true
   */
  focusable?: boolean;
  sticker?: boolean;
  disabled?: boolean;
}

export interface IconProps extends React.HTMLAttributes<any>, TooltipDecoratorProps, BaseIconProps {}

@withTooltip
export class Icon extends React.PureComponent<IconProps> {
  private readonly ref = createRef<HTMLAnchorElement>();

  static defaultProps: IconProps = {
    focusable: true,
  };

  static isSvg(content: string) {
    return String(content).includes("svg+xml"); // data-url for raw svg-icon
  }

  constructor(props: IconProps) {
    super(props);
    autoBind(this);
  }

  get isInteractive() {
    const { interactive, onClick, href, link } = this.props;

    return interactive ?? !!(onClick || href || link);
  }

  onClick(evt: React.MouseEvent) {
    if (this.props.disabled) {
      return;
    }

    if (this.props.onClick) {
      this.props.onClick(evt);
    }
  }

  onKeyDown(evt: React.KeyboardEvent<any>) {
    switch (evt.nativeEvent.code) {
      case "Space":

      // fallthrough
      case "Enter": {
        this.ref.current?.click();
        evt.preventDefault();
        break;
      }
    }

    if (this.props.onKeyDown) {
      this.props.onKeyDown(evt);
    }
  }

  render() {
    const { isInteractive } = this;
    const {
      // skip passing props to icon's html element
      className, href, link, material, svg, size, smallest, small, big,
      disabled, sticker, active, focusable, children,
      interactive: _interactive,
      onClick: _onClick,
      onKeyDown: _onKeyDown,
      ...elemProps
    } = this.props;

    let iconContent: ReactNode;
    const iconProps: Partial<IconProps> = {
      className: cssNames("Icon", className,
        { svg, material, interactive: isInteractive, disabled, sticker, active, focusable },
        !size ? { smallest, small, big } : {},
      ),
      onClick: isInteractive ? this.onClick : undefined,
      onKeyDown: isInteractive ? this.onKeyDown : undefined,
      tabIndex: isInteractive && focusable && !disabled ? 0 : undefined,
      style: size ? { "--size": size + (isNumber(size) ? "px" : "") } as React.CSSProperties : undefined,
      ...elemProps,
    };

    // render as inline svg-icon
    if (typeof svg === "string") {
      const dataUrlPrefix = "data:image/svg+xml;base64,";
      const svgIconDataUrl = svg.startsWith(dataUrlPrefix) ? svg : require(`./${svg}.svg`);
      const svgIconText = typeof svgIconDataUrl == "string" // decode xml from data-url
        ? decode(svgIconDataUrl.replace(dataUrlPrefix, "")) : "";

      iconContent = <span className="icon" dangerouslySetInnerHTML={{ __html: svgIconText }} />;
    }

    // render as material-icon
    if (typeof material === "string") {
      iconContent = <span className="icon" data-icon-name={material}>{material}</span>;
    }

    // wrap icon's content passed from decorator
    iconProps.children = (
      <>
        {iconContent}
        {children}
      </>
    );

    // render icon type
    if (link) {
      const { className, children } = iconProps;

      return (
        <NavLink className={className} to={link} ref={this.ref}>
          {children}
        </NavLink>
      );
    }

    if (href) {
      return <a {...iconProps} href={href} ref={this.ref} />;
    }

    return <i {...iconProps} ref={this.ref} />;
  }
}
