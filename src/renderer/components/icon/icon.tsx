/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./icon.scss";

import type { ReactNode } from "react";
import React, { createRef } from "react";
import { NavLink } from "react-router-dom";
import type { LocationDescriptor } from "history";
import { cssNames } from "../../utils";
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

export interface IconProps extends React.HTMLAttributes<any>, BaseIconProps {}

export function isSvg(content: string): boolean {
  // data-url for raw svg-icon
  return String(content).includes("svg+xml");
}

const RawIcon = withTooltip((props: IconProps) => {
  const ref = createRef<HTMLAnchorElement>();

  const {
  // skip passing props to icon's html element
    className, href, link, material, svg, size, smallest, small, big,
    disabled, sticker, active,
    focusable = true,
    children,
    interactive, onClick, onKeyDown,
    ...elemProps
  } = props;
  const isInteractive = interactive ?? !!(onClick || href || link);

  const boundOnClick = (event: React.MouseEvent) => {
    if (!disabled) {
      onClick?.(event);
    }
  };
  const boundOnKeyDown = (event: React.KeyboardEvent<any>) => {
    switch (event.nativeEvent.code) {
      case "Space":

        // fallthrough
      case "Enter": {
        ref.current?.click();
        event.preventDefault();
        break;
      }
    }

    onKeyDown?.(event);
  };

  let iconContent: ReactNode;
  const iconProps: Partial<IconProps> = {
    className: cssNames("Icon", className,
      { svg, material, interactive: isInteractive, disabled, sticker, active, focusable },
      !size ? { smallest, small, big } : {},
    ),
    onClick: isInteractive ? boundOnClick : undefined,
    onKeyDown: isInteractive ? boundOnKeyDown : undefined,
    tabIndex: isInteractive && focusable && !disabled ? 0 : undefined,
    style: size ? { "--size": size + (isNumber(size) ? "px" : "") } as React.CSSProperties : undefined,
    ...elemProps,
  };

  // render as inline svg-icon
  if (typeof svg === "string") {
    const dataUrlPrefix = "data:image/svg+xml;base64,";
    const svgIconDataUrl = svg.startsWith(dataUrlPrefix) ? svg : require(`./${svg}.svg`);
    const svgIconText = typeof svgIconDataUrl == "string" // decode xml from data-url
      ? decode(svgIconDataUrl.replace(dataUrlPrefix, ""))
      : "";

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
      <NavLink
        className={className}
        to={link}
        ref={ref}
      >
        {children}
      </NavLink>
    );
  }

  if (href) {
    return (
      <a
        {...iconProps}
        href={href}
        ref={ref}
      />
    );
  }

  return <i {...iconProps} ref={ref} />;
});

export const Icon = Object.assign(RawIcon, { isSvg });
