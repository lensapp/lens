/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./avatar.module.scss";

import type { ImgHTMLAttributes, MouseEventHandler } from "react";
import React from "react";
import randomColor from "randomcolor";
import type { StrictReactNode } from "@k8slens/utilities";
import { isTruthy, cssNames } from "@k8slens/utilities";
import { computeDefaultShortName } from "../../../common/catalog/helpers";

export interface AvatarProps {
  title: string;
  colorHash?: string;
  size?: number;
  src?: string;
  background?: string;
  variant?: "circle" | "rounded" | "square";
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
  disabled?: boolean;
  children?: StrictReactNode;
  className?: string;
  id?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  "data-testid"?: string;
}

export const Avatar = ({
  title,
  variant = "rounded",
  size = 32,
  colorHash,
  children,
  background,
  imgProps,
  src,
  className,
  disabled,
  id,
  onClick,
  "data-testid": dataTestId,
}: AvatarProps) => (
  <div
    className={cssNames(
      styles.Avatar,
      variant == "circle" && styles.circle,
      variant == "rounded" && styles.rounded,
      disabled && styles.disabled,
      className,
    )}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      background: background || (
        src
          ? "transparent"
          : randomColor({ seed: colorHash, luminosity: "dark" })
      ),
    }}
    id={id}
    onClick={onClick}
    data-testid={dataTestId}
  >
    {
      src
        ? (
          <img
            src={src}
            {...imgProps}
            alt={title}
          />
        )
        : isTruthy(children)
          ? children
          : computeDefaultShortName(title)
    }
  </div>
);
