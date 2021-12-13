/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./avatar.module.scss";

import type { HTMLAttributes, MouseEventHandler } from "react";
import React from "react";
import type { SingleOrMany } from "../../utils";
import { cssNames } from "../../utils";
import type { ComputeRandomColor } from "./compute-random-color.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import computeRandomColorInjectable from "./compute-random-color.injectable";

export interface AvatarProps extends HTMLAttributes<HTMLElement> {
  colorHash?: string;
  size?: number;
  background?: string;
  variant?: "circle" | "rounded" | "square";
  disabled?: boolean;
  children?: SingleOrMany<React.ReactNode>;
  className?: string;
  id?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  "data-testid"?: string;
}

interface Dependencies {
  computeRandomColor: ComputeRandomColor;
}

const NonInjectedAvatar = ({
  variant = "rounded",
  size = 32,
  colorHash,
  children,
  background,
  className,
  disabled,
  computeRandomColor,
  ...rest
}: AvatarProps & Dependencies) => (
  <div
    className={cssNames(styles.Avatar, {
      [styles.circle]: variant == "circle",
      [styles.rounded]: variant == "rounded",
      [styles.disabled]: disabled,
    }, className)}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: background || computeRandomColor({ seed: colorHash, luminosity: "dark" }),
    }}
    {...rest}
  >
    {children}
  </div>
);

export const Avatar = withInjectables<Dependencies, AvatarProps>(NonInjectedAvatar, {
  getProps: (di, props) => ({
    ...props,
    computeRandomColor: di.inject(computeRandomColorInjectable),
  }),
});
