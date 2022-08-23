/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import type { HTMLAttributes } from "react";
import React from "react";

interface CountdownProps extends HTMLAttributes<HTMLSpanElement> {
  secondsTill: IComputedValue<number>;
}

export const Countdown = observer(({ secondsTill, ...props }: CountdownProps) => (
  <span {...props}>{secondsTill.get()}</span>
));
