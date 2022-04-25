/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./badge.module.scss";

import React, { createRef, useState } from "react";
import { action, observable } from "mobx";
import { observer } from "mobx-react";
import { cssNames } from "../../utils/cssNames";
import { withTooltip } from "../tooltip";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  small?: boolean;
  flat?: boolean;
  label?: React.ReactNode;
  expandable?: boolean;
  disabled?: boolean;
  scrollable?: boolean;
}

// Common handler for all Badge instances
document.addEventListener("selectionchange", () => {
  badgeMeta.hasTextSelected ||= (window.getSelection()?.toString().trim().length ?? 0) > 0;
});

const badgeMeta = observable({
  hasTextSelected: false,
});

export const Badge = withTooltip(observer(({
  small,
  flat,
  label,
  expandable = false,
  disabled,
  scrollable,
  className,
  children,
  ...elemProps
}: BadgeProps) => {
  const elem = createRef<HTMLDivElement>();
  const [isExpanded, setIsExpanded] = useState(false);

  const isExpandable = expandable && elem.current
    ? elem.current.clientWidth < elem.current.scrollWidth
    : false;

  const onMouseUp = action(() => {
    if (!isExpandable || badgeMeta.hasTextSelected) {
      badgeMeta.hasTextSelected = false;
    } else {
      setIsExpanded(!isExpanded);
    }
  });

  return (
    <div
      {...elemProps}
      className={cssNames(styles.badge, className, {
        [styles.small]: small,
        [styles.flat]: flat,
        [styles.clickable]: Boolean(elemProps.onClick) || isExpandable,
        [styles.interactive]: isExpandable,
        [styles.isExpanded]: isExpanded,
        [styles.disabled]: disabled,
        [styles.scrollable]: scrollable,
      })}
      onMouseUp={onMouseUp}
      ref={elem}
    >
      {label}
      {children}
    </div>
  );
}));
