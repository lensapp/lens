/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./button.scss";
import type { ButtonHTMLAttributes } from "react";
import React from "react";
import { cssNames } from "../../utils";
import { withTooltip } from "../tooltip";
import { withInjectables } from "@ogre-tools/injectable-react";
import trackEventInjectable from "../../telemetry/track-event.injectable";
interface Dependencies {
  track: (e: React.MouseEvent) => void;
}

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

const NonInjectedButton = withTooltip((props: ButtonProps & Dependencies) => {
  const {
    waiting, label, primary, accent, plain, hidden, active, big,
    round, outlined, light, children, track, ...btnProps
  } = props;

  if (hidden) return null;

  btnProps.className = cssNames("Button", btnProps.className, {
    waiting, primary, accent, plain, active, big, round, outlined, light,
  });

  const onClick = (e: React.MouseEvent) => {
    track(e);

    if (btnProps.onClick) {
      btnProps.onClick(e);
    }
  };

  // render as link
  if (props.href) {
    return (
      <a {...btnProps} onClick={onClick}>
        {label}
        {children}
      </a>
    );
  }

  // render as button
  return (
    <button
      type="button"
      {...btnProps}
      onClick={onClick}>
      {label}
      {children}
    </button>
  );
});


export const Button = withInjectables<Dependencies, ButtonProps>(
  NonInjectedButton,

  {
    getProps: (di, props) => ({
      track: di.inject(trackEventInjectable),
      ...props,
    }),
  },
);
