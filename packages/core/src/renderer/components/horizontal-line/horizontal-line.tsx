/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import styles from "./horizontal-line.module.scss";
import { cssNames } from "@k8slens/utilities";

interface HorizontalLineProps {
  size?: "xxs" | "xs" | "sm" | "md" | "lg" | "xl";
}

export const HorizontalLine = ({ size = "xl" }: HorizontalLineProps = { size: "xl" }) => {
  const classNames = cssNames(styles.HorizontalLine, styles[`size-${size}`]);

  return <div className={classNames} />;
};
