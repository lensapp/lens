/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./radio.scss";
import React, { useContext, useRef } from "react";
import type { SingleOrMany } from "../../utils";
import { cssNames, noop } from "../../utils";

export interface RadioGroupProps<T> {
  className?: string;
  value?: T;
  asButtons?: boolean;
  disabled?: boolean;
  onChange: (value: T) => void;
  children: SingleOrMany<React.ReactElement<RadioProps<T>>>;
}

interface RadioGroupContext {
  disabled: boolean;
  value: any | undefined;
  onSelect: (newValue: any) => void;
}

const radioGroupContext = React.createContext<RadioGroupContext>({
  disabled: false,
  value: undefined,
  onSelect: noop,
});

export function RadioGroup<T>({
  value,
  asButtons,
  disabled = false,
  onChange,
  className,
  children,
}: RadioGroupProps<T>) {
  return (
    <div
      className={cssNames("RadioGroup", { buttonsView: asButtons }, className)}
    >
      <radioGroupContext.Provider value={{ disabled, onSelect: onChange, value }}>
        {children}
      </radioGroupContext.Provider>
    </div>
  );
}

export interface RadioProps<T> {
  className?: string;
  label: React.ReactNode;
  value: T;
  disabled?: boolean;
}

export function Radio<T>({
  className,
  label,
  value,
  disabled = false,
}: RadioProps<T>) {
  const ctx = useContext(radioGroupContext);
  const ref = useRef<HTMLLabelElement | null>(null);
  const checked = ctx.value === value;

  return (
    <label
      className={cssNames("Radio flex align-center", className, {
        checked,
        disabled: disabled || ctx.disabled,
      })}
      tabIndex={checked ? undefined : 0}
      onKeyDown={event => {
        // Spacebar or Enter key
        if (event.key === " " || event.key === "Enter") {
          ref.current?.click();
          event.preventDefault();
        }
      }}
      ref={ref}
    >
      <input
        type="radio"
        checked={checked}
        onChange={() => ctx.onSelect(value)}
      />
      <i className="tick flex center"/>
      {label ? <div className="label">{label}</div> : null}
    </label>
  );
}
