/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./button.scss";
import type { ButtonHTMLAttributes } from "react";
import React from "react";
import { cssNames } from "../../utils";
import type { TooltipDecoratorProps } from "../tooltip";
import { withTooltip } from "../tooltip";
import { OnClickDecorated } from "../on-click-decorated/on-click-decorated";

export interface ButtonProps extends ButtonHTMLAttributes<any> {
  label?: React.ReactNode;
  waiting?: boolean;
  primary?: boolean;
  accent?: boolean;
  light?: boolean;
  plain?: boolean;
  outlined?: boolean;
  hidden?: boolean;
  active?: boolean;
  big?: boolean;
  round?: boolean;
  href?: string; // render as hyperlink
  target?: "_blank"; // in case of using @href
}

const prepareProps = (props: ButtonProps) => {
  const {
    waiting, label, primary, accent, plain, hidden, active, big,
    round, outlined, light, children, ...btnProps
  } = props;

  btnProps.className = cssNames("Button", btnProps.className, {
    waiting, primary, accent, plain, active, big, round, outlined, light,
  });

  return btnProps;
};

export const Button = withTooltip((props: ButtonProps) => {
  const { label, children, hidden } = props;

  if (hidden) return null;

  const btnProps = prepareProps(props);

  // render as link
  if (props.href) {
    return (
      <a
        {...btnProps}>
        {label}
        {children}
      </a>
    );
  }

  // render as button
  return (
    <button
      type="button"
      {...btnProps}>
      {label}
      {children}
    </button>
  );
});

export const OpenLensButton = (props: ButtonProps & TooltipDecoratorProps) => {
  const { label, children, hidden } = props;

  if (hidden) return null;

  const buttonProps = prepareProps(props);

  return (
    <OnClickDecorated {...buttonProps} tagName={props.href ? "a" : "button"}>
      {label}
      {children}
    </OnClickDecorated>
  );
};
