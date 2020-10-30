import './icon.scss'

import React, { ReactNode } from "react";
import { findDOMNode } from "react-dom";
import { NavLink } from "react-router-dom";
import { LocationDescriptor } from 'history';
import { autobind, cssNames } from "../../utils";
import { TooltipDecoratorProps, withTooltip } from "../tooltip";
import isNumber from "lodash/isNumber"

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
    return interactive || !!(onClick || href || link);
  }

  @autobind()
  onClick(evt: React.MouseEvent) {
    if (this.props.disabled) {
      return;
    }
    if (this.props.onClick) {
      this.props.onClick(evt);
    }
  }

  @autobind()
  onKeyDown(evt: React.KeyboardEvent<any>) {
    switch (evt.nativeEvent.code) {
    case "Space":
    case "Enter":
      const icon = findDOMNode(this) as HTMLElement;
      setTimeout(() => icon.click());
      evt.preventDefault();
      break;
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
        !size ? { smallest, small, big } : {}
      ),
      onClick: isInteractive ? this.onClick : undefined,
      onKeyDown: isInteractive ? this.onKeyDown : undefined,
      tabIndex: isInteractive && focusable && !disabled ? 0 : undefined,
      style: size ? { "--size": size + (isNumber(size) ? "px" : "") } as React.CSSProperties : undefined,
      ...elemProps
    };

    // render as inline svg-icon
    if (svg) {
      const svgIconText = require("!!raw-loader!./" + svg + ".svg").default;
      iconContent = <span className="icon" dangerouslySetInnerHTML={{ __html: svgIconText }}/>;
    }

    // render as material-icon
    if (material) {
      iconContent = <span className="icon">{material}</span>;
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
      return <NavLink {...iconProps} to={link}/>
    }
    if (href) {
      return <a {...iconProps} href={href}/>
    }
    return <i {...iconProps} />
  }
}
