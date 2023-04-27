/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./button.scss";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import React from "react";
import { cssNames, StrictReactNode } from "@k8slens/utilities";
import { withTooltip } from "@k8slens/tooltip";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: StrictReactNode;
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
  href?: string;
  target?: "_blank"; // in case of using @href
  children?: StrictReactNode;
}

export const Button = withTooltip((props: ButtonProps) => {
  const { waiting, label, primary, accent, plain, hidden, active, big, round, outlined, light, children, ...btnProps } =
    props;

  if (hidden) {
    return null;
  }

  btnProps.className = cssNames("Button", btnProps.className, {
    waiting,
    primary,
    accent,
    plain,
    active,
    big,
    round,
    outlined,
    light,
  });

  if (props.href) {
    return (
      <a {...(btnProps as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {label}
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      {...(btnProps as ButtonHTMLAttributes<HTMLButtonElement>)}
      data-waiting={typeof waiting === "boolean" ? String(waiting) : undefined}
    >
      {label}
      {children}
    </button>
  );
});
