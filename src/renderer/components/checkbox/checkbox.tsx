/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./checkbox.scss";
import React from "react";
import type { SingleOrMany } from "../../utils";
import { cssNames, noop } from "../../utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import captureWithIdInjectable from "../../telemetry/capture-with-id.injectable";

export interface CheckboxProps {
  className?: string;
  label?: React.ReactNode;
  inline?: boolean;
  disabled?: boolean;
  value?: boolean;
  onChange?(value: boolean, evt: React.ChangeEvent<HTMLInputElement>): void;
  children?: SingleOrMany<React.ReactChild | React.ReactFragment>;
}

interface Dependencies {
  captureClick: (id: string, action: string) => void;
}

function NonInjectedCheckbox({ label, inline, className, value, children, onChange = noop, disabled, captureClick, ...inputProps }: CheckboxProps & Dependencies) {
  const componentClass = cssNames("Checkbox flex align-center", className, {
    inline,
    checked: value,
    disabled,
  });

  return (
    <label className={componentClass}>
      <input
        {...inputProps}
        type="checkbox"
        checked={value}
        disabled={disabled}
        onChange={event => {
          if (label) {
            captureClick(`${window.location.pathname} ${label.toString()}`, `Checkbox ${event.target.checked ? "On" : "Off"}`);
          }

          onChange(event.target.checked, event);
        }}
      />
      <i className="box flex align-center"/>
      {label ? <span className="label">{label}</span> : null}
      {children}
    </label>
  );
}

export const Checkbox = withInjectables<Dependencies, CheckboxProps>(
  NonInjectedCheckbox,

  {
    getProps: (di, props) => ({
      captureClick: di.inject(captureWithIdInjectable),
      ...props,
    }),
  },
);
