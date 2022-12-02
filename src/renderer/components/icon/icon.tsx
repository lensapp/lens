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
import Configuration from "./configuration.svg";
import Crane from "./crane.svg";
import Group from "./group.svg";
import Helm from "./helm.svg";
import Install from "./install.svg";
import Kube from "./kube.svg";
import LensLogo from "./lens-logo.svg";
import License from "./license.svg";
import LogoLens from "./logo-lens.svg";
import Logout from "./logout.svg";
import Nodes from "./nodes.svg";
import PushOff from "./push_off.svg";
import PushPin from "./push_pin.svg";
import Spinner from "./spinner.svg";
import Ssh from "./ssh.svg";
import Storage from "./storage.svg";
import Terminal from "./terminal.svg";
import Notice from "./notice.svg";
import User from "./user.svg";
import Users from "./users.svg";
import Wheel from "./wheel.svg";
import Workloads from "./workloads.svg";
import type { Logger } from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import loggerInjectable from "../../../common/logger.injectable";

const hrefValidation = /https?:\/\//;

const hrefIsSafe = (href: string) => Boolean(href.match(hrefValidation));

/**
 * Mapping between the local file names and the svgs
 *
 * Because we only really want a fixed list of bundled icons, this is safer so that consumers of
 * `<Icon>` cannot pass in a `../some/path`.
 */
const localSvgIcons = new Map([
  ["configuration", Configuration],
  ["crane", Crane],
  ["group", Group],
  ["helm", Helm],
  ["install", Install],
  ["kube", Kube],
  ["lens-logo", LensLogo],
  ["license", License],
  ["logo-lens", LogoLens],
  ["logout", Logout],
  ["nodes", Nodes],
  ["push_off", PushOff],
  ["push_pin", PushPin],
  ["spinner", Spinner],
  ["ssh", Ssh],
  ["storage", Storage],
  ["terminal", Terminal],
  ["notice", Notice],
  ["user", User],
  ["users", Users],
  ["wheel", Wheel],
  ["workloads", Workloads],
]);

export interface BaseIconProps {
   /**
   * One of the names from https://material.io/icons/
   */
  material?: string;

  /**
   * Either an SVG XML or one of the following names
   * - configuration
   * - crane
   * - group
   * - helm
   * - install
   * - kube
   * - lens-logo
   * - license
   * - logo-lens
   * - logout
   * - nodes
   * - push_off
   * - push_pin
   * - spinner
   * - ssh
   * - storage
   * - terminal
   * - user
   * - users
   * - wheel
   * - workloads
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
  "data-testid"?: string;
}

export interface IconProps extends React.HTMLAttributes<any>, BaseIconProps {}

export function isSvg(content: string): boolean {
  // source code of the asset
  return String(content).includes("<svg");
}

interface Dependencies {
  logger: Logger;
}

const RawIcon = (props: IconProps & Dependencies) => {
  const ref = createRef<HTMLAnchorElement>();

  const {
    // skip passing props to icon's html element
    className, href, link, material, svg, size, smallest, small, big,
    disabled, sticker, active,
    focusable = true,
    children,
    interactive, onClick, onKeyDown,
    logger,
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
    const svgIconText = isSvg(svg)
      ? svg
      : localSvgIcons.get(svg) ?? "";

    iconContent = (
      <span
        className="icon"
        dangerouslySetInnerHTML={{ __html: svgIconText }}
      />
    );
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
    if (hrefIsSafe(href)) {
      return (
        <a
          {...iconProps}
          href={href}
          ref={ref}
        />
      );
    }

    logger.warn("[ICON]: href prop is unsafe, blocking", { href });
  }

  return <i {...iconProps} ref={ref} />;
};

const InjectedIcon = withInjectables<Dependencies, IconProps>(RawIcon, {
  getProps: (di, props) => ({
    ...props,
    logger: di.inject(loggerInjectable),
  }),
});

export const Icon = Object.assign(withTooltip(InjectedIcon), { isSvg });
