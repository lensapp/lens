/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import styles from "./avatar.module.scss";

import React, { HTMLAttributes, ImgHTMLAttributes } from "react";
import randomColor from "randomcolor";
import GraphemeSplitter from "grapheme-splitter";
import { cssNames, iter } from "../../utils";

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
  ].filter(Boolean).join("");
}

export function Avatar(props: AvatarProps) {
  const { title, variant = "rounded", size = 32, colorHash, children, background, imgProps, src, className, disabled, ...rest } = props;

  const getBackgroundColor = () => {
    return background || randomColor({ seed: colorHash, luminosity: "dark" });
  };

  const renderContents = () => {
    if (src) {
      return <img src={src} {...imgProps} alt={title}/>;
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
      style={{ width: `${size}px`, height: `${size}px`, backgroundColor: getBackgroundColor() }}
      {...rest}
    >
      {renderContents()}
    </div>
  );
}
