/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./avatar.module.scss";

import type { HTMLAttributes, ImgHTMLAttributes } from "react";
import React from "react";
import randomColor from "randomcolor";
import GraphemeSplitter from "grapheme-splitter";
import { cssNames, isDefined, iter } from "../../utils";

export interface AvatarProps extends HTMLAttributes<HTMLElement> {
  title: string;
  colorHash?: string;
  size?: number;
  src?: string;
  background?: string;
  variant?: "circle" | "rounded" | "square";
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
  disabled?: boolean;
}

function getNameParts(name: string): string[] {
  const byWhitespace = name.split(/\s+/);

  if (byWhitespace.length > 1) {
    return byWhitespace;
  }

  const byDashes = name.split(/[-_]+/);

  if (byDashes.length > 1) {
    return byDashes;
  }

  return name.split(/@+/);
}

function getLabelFromTitle(title: string) {
  if (!title) {
    return "??";
  }

  const [rawFirst, rawSecond, rawThird] = getNameParts(title);
  const splitter = new GraphemeSplitter();
  const first = splitter.iterateGraphemes(rawFirst);
  const second = rawSecond ? splitter.iterateGraphemes(rawSecond): first;
  const third = rawThird ? splitter.iterateGraphemes(rawThird) : iter.newEmpty();

  return [
    ...iter.take(first, 1),
    ...iter.take(second, 1),
    ...iter.take(third, 1),
  ].filter(isDefined).join("");
}

export function Avatar(props: AvatarProps) {
  const { title, variant = "rounded", size = 32, colorHash, children, background, imgProps, src, className, disabled, ...rest } = props;
  const colorFromHash = randomColor({ seed: colorHash, luminosity: "dark" });

  const renderContents = () => {
    if (src) {
      return (
        <img
          src={src}
          {...imgProps}
          alt={title}
        />
      );
    }

    return children || getLabelFromTitle(title);
  };

  return (
    <div
      className={cssNames(styles.Avatar, {
        [styles.circle]: variant == "circle",
        [styles.rounded]: variant == "rounded",
        [styles.disabled]: disabled,
      }, className)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: background || (src ? "transparent" : colorFromHash),
      }}
      {...rest}
    >
      {renderContents()}
    </div>
  );
}
