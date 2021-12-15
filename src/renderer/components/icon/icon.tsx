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

import "./icon.scss";

import React, { ReactNode } from "react";
import { findDOMNode } from "react-dom";
import { NavLink } from "react-router-dom";
import type { LocationDescriptor } from "history";
import { boundMethod, cssNames } from "../../utils";
import { TooltipDecoratorProps, withTooltip } from "../tooltip";
import isNumber from "lodash/isNumber";

export interface IconProps extends React.HTMLAttributes<any>, TooltipDecoratorProps {
  material?: string;          // material-icon, see available names at https://material.io/icons/
  svg?: string;               // svg-filename without extension in current folder
  link?: LocationDescriptor;   // render icon as NavLink from react-router-dom
  href?: string;              // render icon as hyperlink
  size?: string | number;     // icon-size
  small?: boolean;            // pre-defined icon-size
  smallest?: boolean;            // pre-defined icon-size
  big?: boolean;              // pre-defined icon-size
  active?: boolean;           // apply active-state styles
  interactive?: boolean;      // indicates that icon is interactive and highlight it on focus/hover
  focusable?: boolean;        // allow focus to the icon + show .active styles (default: "true", when icon is interactive)
  sticker?: boolean;
  disabled?: boolean;
}

@withTooltip
export class Icon extends React.PureComponent<IconProps> {
  static defaultProps: IconProps = {
    focusable: true,
  };

  get isInteractive() {
    const { interactive, onClick, href, link } = this.props;

    return interactive ?? !!(onClick || href || link);
  }

  @boundMethod
  onClick(evt: React.MouseEvent) {
    if (this.props.disabled) {
      return;
    }

    if (this.props.onClick) {
      this.props.onClick(evt);
    }
  }

  @boundMethod
  onKeyDown(evt: React.KeyboardEvent<any>) {
    switch (evt.nativeEvent.code) {
      case "Space":

        // fallthrough
      case "Enter": {
        // eslint-disable-next-line react/no-find-dom-node
        const icon = findDOMNode(this) as HTMLElement;

        setTimeout(() => icon.click());
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
      const svgIconText = svg.includes("<svg") ? svg : require(`!!raw-loader!./${svg}.svg`).default;

      iconContent = <span className="icon" dangerouslySetInnerHTML={{ __html: svgIconText }}/>;
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
        <NavLink className={className} to={link}>
          {children}
        </NavLink>
      );
    }

    if (href) {
      return <a {...iconProps} href={href}/>;
    }

    return <i {...iconProps} />;
  }
}
