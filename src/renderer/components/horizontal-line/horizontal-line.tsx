/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import styles from "./horizontal-line.module.scss";
import { cssNames } from "../../utils";

export const HorizontalLine = ({ small } = { small: false }) => (
  <div
    className={cssNames({
      [styles.HorizontalLine]: true,
      [styles.Small]: small,
    })}
  />
);
