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
  Component?: React.ComponentType<any>;
}

const PlainButton = (props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => <button {...props} />;
const PlainAnchor = (props: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => <a {...props} />;

export const Button = withTooltip((props: ButtonProps) => {
  const {
    waiting, label, primary, accent, plain, hidden, active, big,
    round, outlined, light, children, Component, ...btnProps
  } = props;

  if (hidden) return null;

  const ButtonComponent = Component ?? (props.href ? PlainAnchor : PlainButton);

  btnProps.className = cssNames("Button", btnProps.className, {
    waiting, primary, accent, plain, active, big, round, outlined, light,
  });

  // render as link
  if (props.href) {
    return (
      <ButtonComponent
        {...btnProps}>
        {label}
        {children}
      </ButtonComponent>
    );
  }

  // render as button
  return (
    <ButtonComponent
      type="button"
      {...btnProps}>
      {label}
      {children}
    </ButtonComponent>
  );
});

export const OpenLensButton = (props: ButtonProps & TooltipDecoratorProps) => {
  return <Button {...props} Component={(props) => <OnClickDecorated {...props} tagName={props.href ? "a" : "button"} />} />;
};
